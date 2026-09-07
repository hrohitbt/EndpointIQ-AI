import json
import platform
import socket
from datetime import datetime, timezone

from collector.hardware import collect_hardware_info
from collector.security import collect_security_info
from collector.user import collect_user_info
from collector.network import collect_network_info
from collector.applications import collect_applications
from collector.application_diagnostics import collect_application_crashes
from collector.system_diagnostics import (
    collect_system_crashes,
    collect_boot_info,
    collect_driver_issues,
)
from collector.battery import collect_battery_info
from collector.usage import collect_running_processes
from collector.services import collect_services
from api_client import send_device_data


def collect_basic_device_info():
    return {
        "deviceName": socket.gethostname(),
        "os": platform.system(),
        "osVersion": platform.version(),
        "architecture": platform.machine(),
        "collectionTime": datetime.now(timezone.utc).isoformat()
    }


def collect_endpoint_data():
    data = collect_basic_device_info()

    # Hardware telemetry (now includes manufacturer/model/serialNumber/cpuUsagePercent)
    data["hardware"] = collect_hardware_info()

    # Security telemetry
    data["security"] = collect_security_info()

    # User telemetry (now includes loggedInUsers)
    data["user"] = collect_user_info()

    # Network telemetry
    data["network"] = collect_network_info()

    # Application inventory
    data["applications"] = collect_applications()

    # Running processes this cycle (usage-frequency signal for the API's
    # top-apps ranking — see collector/usage.py)
    data["runningProcesses"] = collect_running_processes()

    # Diagnostics: crashes, unexpected shutdowns, battery, boot, drivers
    data["diagnostics"] = {
        "executionCrashes": collect_application_crashes(),
        "systemCrashes": collect_system_crashes(),
        "battery": collect_battery_info(),
        "boot": collect_boot_info(),
        "driverIssues": collect_driver_issues(),
    }

    # Windows services
    data["services"] = collect_services()

    return data


if __name__ == "__main__":
    data = collect_endpoint_data()

    print("EndpointIQ Agent")
    print("================")

    print(json.dumps(data, indent=2))

    print("\nSending telemetry to EndpointIQ API...")

    send_device_data(data)
