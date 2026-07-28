from datetime import datetime, timezone


def calculate_health(device):

    score = 100
    reasons = []
    recommendations = []

    # -----------------------------
    # Compliance
    # -----------------------------
    if device.get("complianceState") != "compliant":
        score -= 30
        reasons.append("Device is Non-Compliant")
        recommendations.append("Review Intune compliance policies")

    # -----------------------------
    # Last Sync
    # -----------------------------
    last_sync = device.get("lastSyncDateTime")

    if last_sync:
        try:
            sync_time = datetime.fromisoformat(
                last_sync.replace("Z", "+00:00")
            )

            hours = (
                datetime.now(timezone.utc) - sync_time
            ).total_seconds() / 3600

            if hours > 24:
                score -= 15
                reasons.append("Device has not synced for more than 24 hours")
                recommendations.append("Force an Intune sync")

            if hours > 72:
                score -= 15
                reasons.append("Device has not synced for more than 72 hours")

        except Exception:
            pass

    # -----------------------------
    # Operating System
    # -----------------------------
    if device.get("operatingSystem", "").lower() != "windows":
        score -= 10
        reasons.append("Non-Windows device")

    # -----------------------------
    # Placeholder Checks
    # (We'll replace these with real data later)
    # -----------------------------

    if device.get("complianceState") != "compliant":
        reasons.append("Security configuration needs attention")

    # -----------------------------
    # Health Status
    # -----------------------------
    if score >= 90:
        status = "Healthy"
        risk = "Low"

    elif score >= 70:
        status = "Warning"
        risk = "Medium"

    else:
        status = "Critical"
        risk = "High"

    return {
        "deviceName": device.get("deviceName"),
        "user": device.get("userPrincipalName"),
        "operatingSystem": device.get("operatingSystem"),
        "healthScore": score,
        "status": status,
        "risk": risk,
        "reasons": reasons,
        "recommendations": recommendations
    }