import json
import re
import subprocess


def run_powershell(command):
    try:
        result = subprocess.run(
            [
                "powershell.exe",
                "-NoProfile",
                "-NonInteractive",
                "-ExecutionPolicy",
                "Bypass",
                "-Command",
                command
            ],
            capture_output=True,
            text=True,
            timeout=30
        )

        if result.returncode != 0:
            return None

        return result.stdout.strip()

    except Exception:
        return None


def parse_json(value):
    if not value:
        return None

    try:
        return json.loads(value)
    except Exception:
        return None


def collect_security_info():

    # -----------------------------
    # BitLocker
    # -----------------------------
    bitlocker = run_powershell(
        "Get-BitLockerVolume -MountPoint 'C:' | "
        "Select-Object -ExpandProperty ProtectionStatus"
    )

    # -----------------------------
    # Microsoft Defender
    # -----------------------------
    defender_raw = run_powershell(
        "Get-MpComputerStatus | "
        "Select-Object AMServiceEnabled,AntivirusEnabled,"
        "RealTimeProtectionEnabled,AntivirusSignatureLastUpdated | "
        "ConvertTo-Json -Compress"
    )

    defender = parse_json(defender_raw)

    # -----------------------------
    # Windows Firewall
    # -----------------------------
    firewall_raw = run_powershell(
        "Get-NetFirewallProfile | "
        "Select-Object Name,Enabled | "
        "ConvertTo-Json -Compress"
    )

    firewall_profiles = parse_json(firewall_raw)

    firewall = {}

    if isinstance(firewall_profiles, dict):
        firewall_profiles = [firewall_profiles]

    if isinstance(firewall_profiles, list):
        for profile in firewall_profiles:
            name = profile.get("Name", "").lower()
            firewall[name] = bool(profile.get("Enabled", False))

    # -----------------------------
    # Secure Boot
    # -----------------------------
    secure_boot_raw = run_powershell(
        "Confirm-SecureBootUEFI"
    )

    secure_boot = None

    if secure_boot_raw:
        secure_boot = secure_boot_raw.lower() == "true"

    # -----------------------------
    # TPM
    # -----------------------------
    tpm_raw = run_powershell(
        "Get-Tpm | "
        "Select-Object TpmPresent,TpmReady,ManagedAuthLevel | "
        "ConvertTo-Json -Compress"
    )

    tpm = parse_json(tpm_raw)

    # -----------------------------
    # Windows Update / patch history
    # -----------------------------
    patches = collect_patch_info()

    # -----------------------------
    # Final structured result
    # -----------------------------
    return {
        "bitlocker": {
            "protectionStatus": bitlocker
        },
        "defender": defender,
        "firewall": firewall,
        "secureBoot": secure_boot,
        "tpm": tpm,
        "patches": patches
    }


def collect_patch_info():
    """
    PowerShell's ConvertTo-Json serializes the InstalledOn [datetime] as
    {"value": "/Date(<epoch-ms>)/", "DateTime": "<locale-formatted string>"}.
    The epoch-ms form is parsed here since it's locale-independent (the
    DateTime string's month name isn't).
    """
    raw = run_powershell(
        "Get-CimInstance Win32_QuickFixEngineering -ErrorAction SilentlyContinue | "
        "Sort-Object InstalledOn -Descending | "
        "Select-Object -First 1 HotFixID,InstalledOn | "
        "ConvertTo-Json -Compress"
    )

    latest = parse_json(raw)

    if not latest or not latest.get("InstalledOn"):
        return {
            "daysSinceLastPatch": None,
            "lastPatchId": None,
            "lastPatchDate": None,
        }

    installed_raw = latest["InstalledOn"]
    installed_value = installed_raw.get("value") if isinstance(installed_raw, dict) else None
    installed_display = installed_raw.get("DateTime") if isinstance(installed_raw, dict) else str(installed_raw)

    days_since = None
    iso_date = None

    if installed_value:
        match = re.search(r"/Date\((\d+)\)/", installed_value)
        if match:
            from datetime import datetime, timezone

            epoch_ms = int(match.group(1))
            parsed = datetime.fromtimestamp(epoch_ms / 1000, tz=timezone.utc)
            days_since = (datetime.now(timezone.utc) - parsed).days
            iso_date = parsed.isoformat()

    return {
        "daysSinceLastPatch": days_since,
        "lastPatchId": latest.get("HotFixID"),
        "lastPatchDate": iso_date or installed_display,
    }