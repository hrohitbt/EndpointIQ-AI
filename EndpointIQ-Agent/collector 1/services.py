import json
import subprocess


def collect_services():
    """
    Collect Windows services that are currently installed.
    We keep the data focused on useful operational information.
    """

    powershell_script = r"""
Get-CimInstance Win32_Service |
    Select-Object @{
        Name="name"
        Expression={$_.Name}
    }, @{
        Name="displayName"
        Expression={$_.DisplayName}
    }, @{
        Name="status"
        Expression={$_.State}
    }, @{
        Name="startMode"
        Expression={$_.StartMode}
    }, @{
        Name="startName"
        Expression={$_.StartName}
    } |
    Sort-Object name |
    ConvertTo-Json -Compress
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

        services = json.loads(output)

        if isinstance(services, dict):
            services = [services]

        return services

    except Exception:
        return []