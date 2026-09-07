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


def collect_battery_info():
    """
    Battery health via `powercfg /batteryreport /XML` — DesignCapacity and
    FullChargeCapacity there are populated reliably across hardware, unlike
    the root\\WMI BatteryStaticData class, which many OEM drivers leave
    empty. Current charge/status still comes from Win32_Battery. Returns
    None on desktops with no battery — absence is not represented as 0% health.
    """
    raw = run_powershell(
        """
$status = Get-CimInstance Win32_Battery -ErrorAction SilentlyContinue | Select-Object -First 1

if (-not $status) {
    Write-Output 'null'
    exit
}

$reportPath = Join-Path $env:TEMP "endpointiq-battery-report.xml"
powercfg /batteryreport /XML /OUTPUT $reportPath | Out-Null

$designCapacity = $null
$fullChargeCapacity = $null
$cycleCount = $null

if (Test-Path $reportPath) {
    [xml]$report = Get-Content $reportPath
    $ns = New-Object System.Xml.XmlNamespaceManager($report.NameTable)
    $ns.AddNamespace('b', 'http://schemas.microsoft.com/battery/2012')
    $battery = $report.SelectSingleNode('//b:Batteries/b:Battery', $ns)
    if ($battery) {
        $designCapacity = [int]$battery.DesignCapacity
        $fullChargeCapacity = [int]$battery.FullChargeCapacity
        $cycleCount = [int]$battery.CycleCount
    }
    Remove-Item $reportPath -ErrorAction SilentlyContinue
}

[PSCustomObject]@{
    designCapacityMWh = $designCapacity
    fullChargeCapacityMWh = $fullChargeCapacity
    cycleCount = $cycleCount
    estimatedChargeRemainingPercent = $status.EstimatedChargeRemaining
    batteryStatus = $status.BatteryStatus
    name = $status.Name
} | ConvertTo-Json -Compress
""",
        timeout=60,
    )

    if raw is None or raw.strip() == "null":
        return None

    data = parse_json(raw)

    if not data:
        return None

    design_capacity = data.get("designCapacityMWh")
    full_charge_capacity = data.get("fullChargeCapacityMWh")

    health_percent = None
    if design_capacity and full_charge_capacity:
        health_percent = round((full_charge_capacity / design_capacity) * 100, 1)

    return {
        "healthPercent": health_percent,
        "designCapacityMWh": design_capacity,
        "fullChargeCapacityMWh": full_charge_capacity,
        "cycleCount": data.get("cycleCount"),
        "chargeRemainingPercent": data.get("estimatedChargeRemainingPercent"),
        "status": data.get("batteryStatus"),
        "name": data.get("name"),
    }
