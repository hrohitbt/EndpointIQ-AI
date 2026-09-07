import json
import subprocess


def run_powershell(command, timeout=30):
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
            timeout=timeout
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


def collect_system_crashes(max_events=50):
    """
    Unexpected shutdowns / kernel power loss: System log Event ID 41
    (Kernel-Power). Same shape as application_diagnostics.py's crash
    events so it drops straight into diagnostics.systemCrashes.
    """
    raw = run_powershell(
        f"""
$events = Get-WinEvent -FilterHashtable @{{
    LogName='System'
    ProviderName='Microsoft-Windows-Kernel-Power'
    Id=41
}} -MaxEvents {max_events} -ErrorAction SilentlyContinue

$events | ForEach-Object {{
    [PSCustomObject]@{{
        timeCreated = $_.TimeCreated.ToString("o")
        provider = $_.ProviderName
        message = $_.Message
    }}
}} | ConvertTo-Json -Compress
"""
    )

    events = parse_json(raw)

    if events is None:
        return []

    if isinstance(events, dict):
        events = [events]

    return events


def collect_boot_info():
    """
    Last boot time, last boot duration (Event ID 100, Diagnostics-Performance),
    and whether Fast Startup (hiberboot) is enabled.
    """
    raw = run_powershell(
        """
$os = Get-CimInstance Win32_OperatingSystem
$bootEvent = Get-WinEvent -FilterHashtable @{
    LogName='Microsoft-Windows-Diagnostics-Performance/Operational'
    Id=100
} -MaxEvents 1 -ErrorAction SilentlyContinue

$hiberboot = Get-ItemProperty -Path `
    'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Power' `
    -Name HiberbootEnabled -ErrorAction SilentlyContinue

$bootDurationMs = $null
if ($bootEvent) {
    $xml = [xml]$bootEvent.ToXml()
    $durationNode = $xml.Event.EventData.Data | Where-Object { $_.Name -eq 'BootTime' }
    if ($durationNode) { $bootDurationMs = [int]$durationNode.'#text' }
}

[PSCustomObject]@{
    lastBootUpTime = $os.LastBootUpTime.ToString("o")
    lastBootDurationMs = $bootDurationMs
    fastStartupEnabled = if ($hiberboot) { [bool]$hiberboot.HiberbootEnabled } else { $null }
} | ConvertTo-Json -Compress
"""
    )

    return parse_json(raw) or {
        "lastBootUpTime": None,
        "lastBootDurationMs": None,
        "fastStartupEnabled": None,
    }


def collect_driver_issues():
    """
    Devices Windows currently flags with a driver/hardware problem
    (Device Manager error state), via Get-PnpDevice.
    """
    raw = run_powershell(
        "Get-PnpDevice -Status Error -ErrorAction SilentlyContinue | "
        "Select-Object FriendlyName,InstanceId,ConfigManagerErrorCode | "
        "ConvertTo-Json -Compress"
    )

    issues = parse_json(raw)

    if issues is None:
        return []

    if isinstance(issues, dict):
        issues = [issues]

    return [
        {
            "name": issue.get("FriendlyName"),
            "instanceId": issue.get("InstanceId"),
            "problemCode": issue.get("ConfigManagerErrorCode"),
        }
        for issue in issues
    ]
