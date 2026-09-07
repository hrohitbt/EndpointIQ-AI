def generate_summary(devices):
    summary = {
        "totalDevices": len(devices),
        "healthy": 0,
        "warning": 0,
        "critical": 0,
        "windows": 0,
        "macOS": 0,
        "android": 0,
        "ios": 0
    }

    for device in devices:

        os_name = (device.get("operatingSystem") or "").lower()

        if os_name == "windows":
            summary["windows"] += 1
        elif os_name == "macos":
            summary["macOS"] += 1
        elif os_name == "android":
            summary["android"] += 1
        elif os_name == "ios":
            summary["ios"] += 1

        score = device.get("healthScore", 0)

        if score >= 80:
            summary["healthy"] += 1
        elif score >= 50:
            summary["warning"] += 1
        else:
            summary["critical"] += 1

    return summary