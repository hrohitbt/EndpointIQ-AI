import hashlib
import hmac
import os
import secrets
import time
from datetime import datetime, timezone
from pathlib import Path
import json

import anthropic
from anthropic import beta_tool
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


# =========================================================
# PER-DEVICE HISTORY
#
# save_device() above only ever keeps the latest snapshot — a device's
# JSON file is overwritten on every collection cycle, so there was no
# way to show a resource trend for a single device. This appends a
# compact row per collection instead, capped so it can't grow unbounded.
# =========================================================

HISTORY_DIR = DATA_DIR / "history"
HISTORY_DIR.mkdir(exist_ok=True)
HISTORY_MAX_ROWS = 288  # 24h of history at a 5-minute collection interval


def history_path(device_name: str) -> Path:
    safe_name = "".join(c if c.isalnum() or c in "-_." else "_" for c in device_name)
    return HISTORY_DIR / f"{safe_name}.json"


def load_device_history(device_name: str):
    path = history_path(device_name)
    if not path.exists():
        return []
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return []


def record_device_history(device_name: str, data: dict):
    hw = data.get("hardware") or {}
    diag = data.get("diagnostics") or {}

    row = {
        "timestamp": data.get("agentLastSeen") or datetime.now(timezone.utc).isoformat(),
        "ramUsagePercent": hw.get("ramUsagePercent"),
        "diskUsagePercent": hw.get("diskUsagePercent"),
        "cpuUsagePercent": hw.get("cpuUsagePercent"),
        "experienceScore": compute_experience_score(data),
        "executionCrashCount": len(diag.get("executionCrashes") or []),
        "systemCrashCount": len(diag.get("systemCrashes") or []),
        "runningProcesses": data.get("runningProcesses") or [],
    }

    rows = load_device_history(device_name)
    rows.append(row)
    rows = rows[-HISTORY_MAX_ROWS:]

    history_path(device_name).write_text(
        json.dumps(rows, indent=2, ensure_ascii=False), encoding="utf-8"
    )


def compute_top_processes(device_name: str, limit: int = 10):
    """
    Ranks processes by how many recorded collection cycles they were seen
    running in — the closest honest "most used" signal available without
    continuous focus-time instrumentation. cyclesTotal lets the UI show
    this as a fraction/percentage rather than a bare count.
    """
    rows = load_device_history(device_name)
    cycles_total = len(rows)
    counts = {}

    for row in rows:
        for name in row.get("runningProcesses") or []:
            counts[name] = counts.get(name, 0) + 1

    ranked = sorted(counts.items(), key=lambda kv: kv[1], reverse=True)[:limit]

    return {
        "cyclesTotal": cycles_total,
        "processes": [{"name": name, "cyclesSeen": count} for name, count in ranked],
    }


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

    patches = security.get("patches") or {}
    days_since_patch = patches.get("daysSinceLastPatch")
    if days_since_patch is None:
        patch_status = "Data unavailable"
    elif days_since_patch <= 35:
        patch_status = "Compliant"
    else:
        patch_status = "Review"

    return {
        "bitlocker": bitlocker_status,
        "defender": "Compliant" if av_ok and av_reported else ("Review" if av_reported else "Data unavailable"),
        "firewall": "Compliant" if firewall_ok else ("Review" if firewall_reported else "Data unavailable"),
        "patches": patch_status,
    }


def fleet_insights(device_list):
    insights = []
    for device in device_list:
        name = device.get("deviceName") or device.get("computerName") or "Unknown device"
        sec = security_state(device)
        apps = device.get("applications") or []
        crashes = (
            (device.get("diagnostics") or {}).get("executionCrashes")
            or device.get("applicationDiagnostics")
            or device.get("applicationCrashes")
            or []
        )
        system_crashes = (device.get("diagnostics") or {}).get("systemCrashes") or []
        if crashes:
            insights.append({
                "severity": "high",
                "device": name,
                "title": f"Application crash activity detected on {name}",
                "detail": f"{len(crashes)} crash event(s) are available for investigation.",
            })
        if system_crashes:
            insights.append({
                "severity": "high",
                "device": name,
                "title": f"Unexpected shutdown detected on {name}",
                "detail": f"{len(system_crashes)} event(s) indicate the system rebooted without a clean shutdown (Event ID 41).",
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
    patches = dashboard["security"].get("patches", {})
    compliant = (
        bit.get("Compliant", 0) + def_.get("Compliant", 0)
        + fw.get("Compliant", 0) + patches.get("Compliant", 0)
    )
    total = dashboard["deviceCount"] * 4
    compliance_rate = round((compliant / total) * 100) if total else 0

    row = {
        "date": today,
        "deviceCount": dashboard["deviceCount"],
        "complianceRate": compliance_rate,
        "experienceScore": dashboard.get("experienceScore"),
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
    try:
        record_device_history(device_name, data)
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


@app.get("/api/agent/device/{device_name}/history")
def get_device_history(device_name: str, _: str = Depends(require_user)):
    return {
        "status": "success",
        "history": load_device_history(device_name),
        "topProcesses": compute_top_processes(device_name),
    }


@app.get("/api/agent/dashboard")
def get_dashboard(_: str = Depends(require_user)):
    device_list = list(devices.values())
    security_counts = {"bitlocker": {}, "defender": {}, "firewall": {}, "patches": {}}
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

    scores = [s for s in (compute_experience_score(d) for d in device_list) if s is not None]
    experience_score = round(sum(scores) / len(scores)) if scores else None

    dashboard = {
        "status": "success",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "deviceCount": len(device_list),
        "applicationCount": application_count,
        "serviceCount": service_count,
        "crashEventCount": crash_events,
        "security": security_counts,
        "insights": fleet_insights(device_list),
        "experienceScore": experience_score,
        "experienceBuckets": compute_experience_buckets(device_list),
    }

    record_daily_snapshot(dashboard)
    return dashboard


@app.get("/api/agent/trends")
def get_trends(_: str = Depends(require_user)):
    return {"status": "success", "trends": load_trends()}


# =========================================================
# FLEET ASSISTANT
#
# A real Claude agent that investigates the fleet through tools
# backed by the same deterministic functions the rest of the API
# uses (fleet_insights, compute_device_risk, security_state, ...).
# Every answer is grounded in a tool call against live telemetry —
# the model never sees the raw device store directly.
# =========================================================

def build_fleet_summary(device_list):
    lines = []
    if not device_list:
        return ["No devices have reported telemetry yet."]

    for device in device_list:
        name = device.get("deviceName") or device.get("computerName") or "Unknown device"
        sec = security_state(device)
        hw = device.get("hardware") or {}
        diag = device.get("diagnostics") or {}
        exec_crashes = diag.get("executionCrashes") or []
        sys_crashes = diag.get("systemCrashes") or []
        battery = diag.get("battery")

        parts = [f"{name}:"]
        parts.append(f"BitLocker {sec['bitlocker'].lower()}, Defender {sec['defender'].lower()}, Firewall {sec['firewall'].lower()}.")
        if hw.get("ramUsagePercent") is not None:
            parts.append(f"RAM at {hw['ramUsagePercent']}%, disk at {hw.get('diskUsagePercent', 'unknown')}%.")
        if exec_crashes or sys_crashes:
            parts.append(f"{len(exec_crashes)} app crash(es) and {len(sys_crashes)} unexpected shutdown(s) in the last 24h.")
        else:
            parts.append("No crash or shutdown events in the last 24h.")
        if battery and battery.get("healthPercent") is not None:
            parts.append(f"Battery health {battery['healthPercent']}%.")
        lines.append(" ".join(parts))
    return lines


FLEET_ASSISTANT_SYSTEM_PROMPT = """You are the EndpointIQ Fleet Assistant, embedded in an IT admin console.
You help the admin investigate their device fleet — crashes, security compliance, performance,
battery, drivers, and which devices need attention — by calling the tools provided. Every tool
reads live telemetry; never guess or invent a value that isn't returned by a tool call.
Keep answers concise and concrete (name devices, cite numbers). If the fleet has no devices yet,
say so plainly."""


@beta_tool
def list_devices() -> str:
    """List every device currently reporting telemetry, with last-seen time and experience score."""
    device_list = list(devices.values())
    rows = [
        {
            "device": d.get("deviceName") or d.get("computerName") or "Unknown",
            "agentLastSeen": d.get("agentLastSeen"),
            "experienceScore": compute_experience_score(d),
        }
        for d in device_list
    ]
    return json.dumps(rows)


@beta_tool
def get_device(device_name: str) -> str:
    """Get the full telemetry payload for one device by name (hardware, security, diagnostics, network, applications, services, user).

    Args:
        device_name: The device's name, as returned by list_devices.
    """
    device = devices.get(device_name)
    if not device:
        return json.dumps({"error": f"No device named '{device_name}' has reported telemetry."})
    return json.dumps(device, default=str)


@beta_tool
def get_fleet_insights() -> str:
    """Get the current fleet-wide insights (crashes, unexpected shutdowns, BitLocker issues, application inventory notes)."""
    return json.dumps(fleet_insights(list(devices.values())))


@beta_tool
def get_risk_ranking() -> str:
    """Get every device ranked by a composite risk score (security, crashes, battery, disk/RAM pressure), highest risk first."""
    device_list = list(devices.values())
    ranked = sorted((compute_device_risk(d) for d in device_list), key=lambda r: r["score"], reverse=True)
    return json.dumps(ranked)


def answer_fleet_question(question: str) -> str:
    client = anthropic.Anthropic()

    runner = client.beta.messages.tool_runner(
        model="claude-opus-5",
        max_tokens=16000,
        system=FLEET_ASSISTANT_SYSTEM_PROMPT,
        tools=[list_devices, get_device, get_fleet_insights, get_risk_ranking],
        messages=[{"role": "user", "content": question}],
    )

    final_message = None
    for message in runner:
        final_message = message

    if final_message is None:
        return "The assistant didn't return a response."

    return next(
        (block.text for block in final_message.content if block.type == "text"),
        "The assistant didn't return a text answer.",
    )


def compute_experience_score(device):
    """
    A composite "device experience" score (0-100), Nexthink-DEX-style: it
    blends security, performance, reliability and network signals instead
    of reporting security compliance alone. Every component is derived
    from a real reported field; a category with no data contributes
    nothing (not assumed healthy, not assumed broken).
    """
    sec_state = security_state(device)
    sec_keys = ["bitlocker", "defender", "firewall", "patches"]
    sec_reported = [k for k in sec_keys if sec_state[k] != "Data unavailable"]
    security_component = (
        round(100 * sum(1 for k in sec_reported if sec_state[k] == "Compliant") / len(sec_reported))
        if sec_reported else None
    )

    hw = device.get("hardware") or {}
    perf_penalties = []
    if hw.get("ramUsagePercent") is not None:
        perf_penalties.append(max(0, hw["ramUsagePercent"] - 80) * 2)
    if hw.get("diskUsagePercent") is not None:
        perf_penalties.append(max(0, hw["diskUsagePercent"] - 80) * 2)
    performance_component = round(max(0, 100 - sum(perf_penalties))) if perf_penalties else None

    diag = device.get("diagnostics") or {}
    exec_crashes = diag.get("executionCrashes")
    sys_crashes = diag.get("systemCrashes")
    if exec_crashes is not None or sys_crashes is not None:
        penalty = len(exec_crashes or []) * 10 + len(sys_crashes or []) * 20
        reliability_component = round(max(0, 100 - penalty))
    else:
        reliability_component = None

    adapters = (device.get("network") or {}).get("adapters") or []
    wifi = [a for a in adapters if "wi-fi" in str(a.get("Name", "")).lower()]
    network_component = (
        round(100 * sum(1 for a in wifi if a.get("Status") == "Up") / len(wifi))
        if wifi else None
    )

    weights = {
        "security": (security_component, 0.40),
        "performance": (performance_component, 0.25),
        "reliability": (reliability_component, 0.20),
        "network": (network_component, 0.15),
    }
    available = [(val, w) for val, w in weights.values() if val is not None]
    if not available:
        return None
    total_weight = sum(w for _, w in available)
    score = sum(val * w for val, w in available) / total_weight
    return round(score)


def compute_experience_buckets(device_list):
    buckets = {"good": 0, "needsAttention": 0, "critical": 0, "noData": 0}
    for d in device_list:
        score = compute_experience_score(d)
        if score is None:
            buckets["noData"] += 1
        elif score >= 80:
            buckets["good"] += 1
        elif score >= 50:
            buckets["needsAttention"] += 1
        else:
            buckets["critical"] += 1
    return buckets


def compute_device_risk(device):
    """
    A composite risk score from real signals only — each point is tied to
    something the agent actually reported, never an estimate. Used to rank
    "what needs attention" instead of making the person hunt through pages.
    """
    score = 0
    reasons = []
    sec = device.get("security") or {}
    checks = {
        "bitlocker": (sec.get("bitlocker") or {}).get("protectionStatus"),
    }
    sec_state = security_state(device)
    if sec_state["bitlocker"] == "Review":
        score += 25
        reasons.append("BitLocker not compliant")
    if sec_state["defender"] == "Review":
        score += 25
        reasons.append("Defender not compliant")
    if sec_state["firewall"] == "Review":
        score += 15
        reasons.append("Firewall not fully enabled")
    if sec_state["patches"] == "Review":
        score += 20
        reasons.append("Patches overdue (>35 days)")

    diag = device.get("diagnostics") or {}
    exec_crashes = diag.get("executionCrashes") or []
    sys_crashes = diag.get("systemCrashes") or []
    if sys_crashes:
        score += 30
        reasons.append(f"{len(sys_crashes)} unexpected shutdown(s)")
    if exec_crashes:
        score += 15
        reasons.append(f"{len(exec_crashes)} application crash(es)")

    battery = diag.get("battery")
    if battery and battery.get("healthPercent") is not None and battery["healthPercent"] < 80:
        score += 10
        reasons.append(f"Battery health {battery['healthPercent']}%")

    hw = device.get("hardware") or {}
    if (hw.get("diskUsagePercent") or 0) > 85:
        score += 10
        reasons.append(f"Disk at {hw['diskUsagePercent']}%")
    if (hw.get("ramUsagePercent") or 0) > 90:
        score += 5
        reasons.append(f"RAM at {hw['ramUsagePercent']}%")

    return {
        "device": device.get("deviceName") or "Unknown device",
        "score": min(score, 100),
        "reasons": reasons,
    }


@app.get("/api/agent/ai-risk")
def get_ai_risk(_: str = Depends(require_user)):
    device_list = list(devices.values())
    ranked = sorted((compute_device_risk(d) for d in device_list), key=lambda r: r["score"], reverse=True)
    return {"status": "success", "ranked": ranked}


class AIQuestion(BaseModel):
    question: str


@app.get("/api/agent/ai-summary")
def get_ai_summary(_: str = Depends(require_user)):
    device_list = list(devices.values())
    return {"status": "success", "summary": build_fleet_summary(device_list)}


@app.post("/api/agent/ai-query")
def post_ai_query(payload: AIQuestion, _: str = Depends(require_user)):
    if not os.environ.get("ANTHROPIC_API_KEY"):
        raise HTTPException(
            status_code=503,
            detail=(
                "The Fleet Assistant has no Claude credentials configured. "
                "Set ANTHROPIC_API_KEY on the machine running this API, then restart it."
            ),
        )
    try:
        answer = answer_fleet_question(payload.question)
    except (anthropic.AnthropicError, TypeError) as e:
        # TypeError: this SDK version raises a bare TypeError (not an
        # AnthropicError subclass) when the credential resolution itself
        # fails deep inside request-building, not just at client construction.
        raise HTTPException(
            status_code=503,
            detail=f"The Fleet Assistant couldn't reach Claude: {e}",
        )
    return {"status": "success", "question": payload.question, "answer": answer}
