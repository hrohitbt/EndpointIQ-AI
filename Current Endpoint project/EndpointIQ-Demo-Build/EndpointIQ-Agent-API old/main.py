import hashlib
import hmac
import os
import secrets
import time
from datetime import datetime, timezone
from pathlib import Path
import json

from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)
TRENDS_FILE = DATA_DIR / "trends.json"

# =========================================================
# CONFIG / SECRETS
#
# Everything here can (and for a real rollout, should) be
# overridden with environment variables instead of the
# defaults below. Defaults exist only so the demo runs
# out of the box.
# =========================================================

AGENT_API_KEY = os.environ.get("ENDPOINTIQ_AGENT_KEY", "dev-agent-key-change-me")
PORTAL_USERNAME = os.environ.get("ENDPOINTIQ_ADMIN_USER", "admin")
PORTAL_PASSWORD = os.environ.get("ENDPOINTIQ_ADMIN_PASSWORD", "EndpointIQ@123")
TOKEN_SECRET = os.environ.get("ENDPOINTIQ_TOKEN_SECRET", "dev-token-secret-change-me")
TOKEN_TTL_SECONDS = 8 * 60 * 60  # 8 hour session

app = FastAPI(
    title="EndpointIQ Agent API",
    description="Telemetry ingestion and endpoint intelligence API",
    version="2.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Telemetry(BaseModel):
    data: dict


class LoginRequest(BaseModel):
    username: str
    password: str


# =========================================================
# AUTH
#
# Two separate trust boundaries on purpose:
#   - Agents authenticate with a shared API key (X-Agent-Key)
#     to POST telemetry. Agents don't get user sessions.
#   - Portal users authenticate with username/password and
#     get a short-lived signed token (Authorization: Bearer)
#     to read dashboard/device data.
# =========================================================

def _sign(payload: str) -> str:
    return hmac.new(TOKEN_SECRET.encode(), payload.encode(), hashlib.sha256).hexdigest()


def issue_token(username: str) -> str:
    expires = int(time.time()) + TOKEN_TTL_SECONDS
    payload = f"{username}:{expires}"
    signature = _sign(payload)
    return f"{payload}:{signature}"


def verify_token(token: str) -> bool:
    try:
        username, expires, signature = token.split(":")
    except ValueError:
        return False
    expected = _sign(f"{username}:{expires}")
    if not hmac.compare_digest(expected, signature):
        return False
    return int(expires) >= int(time.time())


def require_user(authorization: str = Header(default="")) -> str:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = authorization.removeprefix("Bearer ").strip()
    if not verify_token(token):
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    return token


def require_agent(x_agent_key: str = Header(default="")) -> None:
    if not secrets.compare_digest(x_agent_key, AGENT_API_KEY):
        raise HTTPException(status_code=401, detail="Invalid agent key")


# =========================================================
# DEVICE STORE
# =========================================================

def load_devices():
    result = {}
    for path in DATA_DIR.glob("*.json"):
        if path.name == "trends.json":
            continue
        try:
            data = json.loads(path.read_text(encoding="utf-8-sig"))
            name = data.get("deviceName") or data.get("computerName") or path.stem
            result[name] = data
        except (OSError, json.JSONDecodeError):
            continue
    return result


devices = load_devices()


def save_device(data: dict, device_name: str):
    safe_name = "".join(c if c.isalnum() or c in "-_." else "_" for c in device_name)
    (DATA_DIR / f"{safe_name}.json").write_text(
        json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8"
    )


def bool_value(value):
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        v = value.strip().lower()
        if v in {"true", "yes", "on", "enabled", "ready", "protected"}:
            return True
        if v in {"false", "no", "off", "disabled", "not ready", "unprotected"}:
            return False
    return None


def security_state(device):
    security = device.get("security") or {}
    bitlocker = security.get("bitlocker") or {}
    defender = security.get("defender") or {}
    firewall = security.get("firewall") or {}

    bitlocker_raw = (
        bitlocker.get("protectionStatus")
        or bitlocker.get("ProtectionStatus")
        or bitlocker.get("volumeStatus")
    )
    bitlocker_text = str(bitlocker_raw or "").strip().lower()
    if bitlocker_text:
        bitlocker_ok = any(x in bitlocker_text for x in ("on", "protected", "encrypted", "fully"))
        bitlocker_status = "Compliant" if bitlocker_ok else "Review"
    else:
        bitlocker_status = "Data unavailable"

    av_ok = all(
        bool_value(defender.get(k)) is True
        for k in ("AMServiceEnabled", "AntivirusEnabled", "RealTimeProtectionEnabled")
        if k in defender
    ) if defender else False
    av_reported = any(k in defender for k in ("AMServiceEnabled", "AntivirusEnabled", "RealTimeProtectionEnabled"))

    firewall_values = [bool_value(v) for v in firewall.values()]
    firewall_reported = bool(firewall_values)
    firewall_ok = firewall_reported and all(v is True for v in firewall_values if v is not None)

    return {
        "bitlocker": bitlocker_status,
        "defender": "Compliant" if av_ok and av_reported else ("Review" if av_reported else "Data unavailable"),
        "firewall": "Compliant" if firewall_ok else ("Review" if firewall_reported else "Data unavailable"),
    }


def fleet_insights(device_list):
    insights = []
    for device in device_list:
        name = device.get("deviceName") or device.get("computerName") or "Unknown device"
        sec = security_state(device)
        apps = device.get("applications") or []
        crashes = device.get("applicationDiagnostics") or device.get("applicationCrashes") or []
        if crashes:
            insights.append({
                "severity": "high",
                "device": name,
                "title": f"Application crash activity detected on {name}",
                "detail": f"{len(crashes)} crash event(s) are available for investigation.",
            })
        if sec["bitlocker"] == "Review":
            insights.append({
                "severity": "high",
                "device": name,
                "title": f"BitLocker requires review on {name}",
                "detail": "The agent reported a BitLocker state that does not clearly indicate protection.",
            })
        if sec["bitlocker"] == "Data unavailable":
            insights.append({
                "severity": "medium",
                "device": name,
                "title": f"BitLocker telemetry is incomplete on {name}",
                "detail": "The endpoint is reporting security telemetry, but a usable BitLocker protection state is not currently available.",
            })
        if apps:
            # Only surface inventory volume as context; never invent an issue.
            insights.append({
                "severity": "info",
                "device": name,
                "title": f"Application inventory available for {name}",
                "detail": f"{len(apps)} installed applications were reported by the agent.",
            })
    return insights[:20]


# =========================================================
# TRENDS
#
# One rollup row per calendar day (UTC). Recorded whenever
# the dashboard is computed, so no scheduler is needed for
# the demo. Upserts today's row rather than appending
# duplicates if the dashboard is refreshed repeatedly.
# =========================================================

def load_trends():
    if not TRENDS_FILE.exists():
        return []
    try:
        return json.loads(TRENDS_FILE.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return []


def save_trends(rows):
    TRENDS_FILE.write_text(json.dumps(rows, indent=2, ensure_ascii=False), encoding="utf-8")


def record_daily_snapshot(dashboard: dict):
    today = datetime.now(timezone.utc).date().isoformat()
    bit = dashboard["security"]["bitlocker"]
    def_ = dashboard["security"]["defender"]
    fw = dashboard["security"]["firewall"]
    compliant = (bit.get("Compliant", 0) + def_.get("Compliant", 0) + fw.get("Compliant", 0))
    total = dashboard["deviceCount"] * 3
    compliance_rate = round((compliant / total) * 100) if total else 0

    row = {
        "date": today,
        "deviceCount": dashboard["deviceCount"],
        "complianceRate": compliance_rate,
        "crashEventCount": dashboard["crashEventCount"],
        "openInsights": len(dashboard["insights"]),
    }

    rows = load_trends()
    rows = [r for r in rows if r.get("date") != today]
    rows.append(row)
    rows.sort(key=lambda r: r["date"])
    rows = rows[-90:]  # keep last 90 days
    save_trends(rows)
    return rows


# =========================================================
# ROUTES
# =========================================================

@app.get("/")
def root():
    return {"status": "success", "message": "EndpointIQ Agent API is running"}


@app.post("/api/agent/auth/login")
def login(payload: LoginRequest):
    if not (
        secrets.compare_digest(payload.username, PORTAL_USERNAME)
        and secrets.compare_digest(payload.password, PORTAL_PASSWORD)
    ):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return {
        "status": "success",
        "token": issue_token(payload.username),
        "expiresInSeconds": TOKEN_TTL_SECONDS,
        "username": payload.username,
    }


@app.post("/api/agent/telemetry")
def receive_telemetry(payload: Telemetry, _: None = Depends(require_agent)):
    data = payload.data
    device_name = data.get("deviceName") or data.get("computerName") or "Unknown"
    data["agentLastSeen"] = datetime.now(timezone.utc).isoformat()
    devices[device_name] = data
    try:
        save_device(data, device_name)
    except OSError:
        pass
    print(f"Telemetry received from: {device_name}")
    return {
        "status": "success",
        "message": "Telemetry received and stored",
        "deviceName": device_name,
    }


@app.get("/api/agent/devices")
def get_devices(_: str = Depends(require_user)):
    device_list = list(devices.values())
    return {"status": "success", "device_count": len(device_list), "devices": device_list}


@app.get("/api/agent/device/{device_name}")
def get_device(device_name: str, _: str = Depends(require_user)):
    device = devices.get(device_name)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return {"status": "success", "device": device}


@app.get("/api/agent/dashboard")
def get_dashboard(_: str = Depends(require_user)):
    device_list = list(devices.values())
    security_counts = {"bitlocker": {}, "defender": {}, "firewall": {}}
    for device in device_list:
        sec = security_state(device)
        for key, value in sec.items():
            security_counts[key][value] = security_counts[key].get(value, 0) + 1

    crash_events = sum(
        len(d.get("applicationDiagnostics") or d.get("applicationCrashes") or [])
        for d in device_list
    )
    application_count = sum(len(d.get("applications") or []) for d in device_list)
    service_count = sum(len(d.get("services") or []) for d in device_list)

    dashboard = {
        "status": "success",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "deviceCount": len(device_list),
        "applicationCount": application_count,
        "serviceCount": service_count,
        "crashEventCount": crash_events,
        "security": security_counts,
        "insights": fleet_insights(device_list),
    }

    record_daily_snapshot(dashboard)
    return dashboard


@app.get("/api/agent/trends")
def get_trends(_: str = Depends(require_user)):
    return {"status": "success", "trends": load_trends()}
