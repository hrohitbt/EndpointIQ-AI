import json
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
    # Final structured result
    # -----------------------------
    return {
        "bitlocker": {
            "protectionStatus": bitlocker
        },
        "defender": defender,
        "firewall": firewall,
        "secureBoot": secure_boot,
        "tpm": tpm
    }