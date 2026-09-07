import json
import platform
import subprocess

import psutil


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


def collect_device_identity():
    raw = run_powershell(
        "$cs = Get-CimInstance Win32_ComputerSystem; "
        "$bios = Get-CimInstance Win32_BIOS; "
        "[PSCustomObject]@{ "
        "Manufacturer = $cs.Manufacturer; "
        "Model = $cs.Model; "
        "SerialNumber = $bios.SerialNumber "
        "} | ConvertTo-Json -Compress"
    )

    identity = parse_json(raw) or {}

    return {
        "manufacturer": identity.get("Manufacturer"),
        "model": identity.get("Model"),
        "serialNumber": identity.get("SerialNumber"),
    }


def collect_hardware_info():
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage("C:\\")
    identity = collect_device_identity()

    return {
        "processor": platform.processor(),
        "architecture": platform.machine(),
        "cpuUsagePercent": psutil.cpu_percent(interval=1),
        "ramTotalGB": round(memory.total / (1024 ** 3), 2),
        "ramAvailableGB": round(memory.available / (1024 ** 3), 2),
        "ramUsagePercent": memory.percent,
        "diskTotalGB": round(disk.total / (1024 ** 3), 2),
        "diskFreeGB": round(disk.free / (1024 ** 3), 2),
        "diskUsagePercent": disk.percent,
        "manufacturer": identity.get("manufacturer"),
        "model": identity.get("model"),
        "serialNumber": identity.get("serialNumber"),
    }
