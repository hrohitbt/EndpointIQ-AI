import json
import subprocess


def collect_applications():
    """
    Collect installed Windows applications from both
    64-bit and 32-bit uninstall registry locations.
    """

    powershell_script = r"""
$paths = @(
    "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*",
    "HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*",
    "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*"
)

$apps = foreach ($path in $paths) {
    Get-ItemProperty $path -ErrorAction SilentlyContinue |
    Where-Object {
        $_.DisplayName -and
        $_.SystemComponent -ne 1
    } |
    Select-Object @{
        Name="name"
        Expression={$_.DisplayName}
    }, @{
        Name="version"
        Expression={$_.DisplayVersion}
    }, @{
        Name="publisher"
        Expression={$_.Publisher}
    }, @{
        Name="installDate"
        Expression={$_.InstallDate}
    }
}

$apps |
    Sort-Object name -Unique |
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

        applications = json.loads(output)

        if isinstance(applications, dict):
            applications = [applications]

        return applications

    except Exception:
        return []