import re
import subprocess


def collect_application_crashes(max_events=50):
    """
    Collect Windows Application Error events (Event ID 1000)
    and convert them into structured application crash data.
    """

    powershell_script = f"""
$events = Get-WinEvent -FilterHashtable @{{
    LogName='Application'
    Id=1000
}} -MaxEvents {max_events} -ErrorAction SilentlyContinue

$result = foreach ($event in $events) {{

    $message = $event.Message

    [PSCustomObject]@{{
        timeCreated = $event.TimeCreated.ToString("o")
        provider = $event.ProviderName
        message = $message
    }}
}}

$result | ConvertTo-Json -Compress
"""

    try:
        result = subprocess.run(
            [
                "powershell.exe",
                "-NoProfile",
                "-NonInteractive",
                "-ExecutionPolicy",
                "Bypass",
                "-Command",
                powershell_script
            ],
            capture_output=True,
            text=True,
            timeout=60
        )

        if result.returncode != 0:
            return []

        output = result.stdout.strip()

        if not output:
            return []

        import json

        events = json.loads(output)

        if isinstance(events, dict):
            events = [events]

        crashes = []

        for event in events:

            message = event.get("message", "")

            crashes.append({
                "timeCreated": event.get("timeCreated"),
                "provider": event.get("provider"),
                "application": extract_value(
                    message,
                    r"Faulting application name:\s*(.*?),"
                ),
                "applicationVersion": extract_value(
                    message,
                    r"Faulting application name:.*?, version:\s*(.*?),"
                ),
                "faultingModule": extract_value(
                    message,
                    r"Faulting module name:\s*(.*?),"
                ),
                "exceptionCode": extract_value(
                    message,
                    r"Exception code:\s*(.*?),"
                ),
                "faultOffset": extract_value(
                    message,
                    r"Fault offset:\s*(.*?),"
                ),
                "processId": extract_value(
                    message,
                    r"Faulting process id:\s*(.*)"
                ),
                "applicationPath": extract_value(
                    message,
                    r"Faulting application path:\s*(.*)"
                ),
                "faultingModulePath": extract_value(
                    message,
                    r"Faulting module path:\s*(.*)"
                ),
                "reportId": extract_value(
                    message,
                    r"Report Id:\s*(.*)"
                )
            })

        return crashes

    except Exception:
        return []


def extract_value(message, pattern):

    match = re.search(
        pattern,
        message,
        re.MULTILINE
    )

    if match:
        return match.group(1).strip()

    return None


if __name__ == "__main__":

    import json

    crashes = collect_application_crashes()

    print(
        json.dumps(
            crashes,
            indent=2
        )
    )