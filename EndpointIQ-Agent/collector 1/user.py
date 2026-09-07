import os
import getpass
import subprocess


def run_command(command):
    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=10,
            shell=True
        )

        if result.returncode == 0:
            return result.stdout.strip()

        return None

    except Exception:
        return None


def collect_user_info():

    username = getpass.getuser()

    domain = os.environ.get("USERDOMAIN")

    user_profile = os.environ.get("USERPROFILE")

    computer_domain = run_command(
        "powershell.exe -NoProfile -Command "
        "\"(Get-CimInstance Win32_ComputerSystem).Domain\""
    )

    return {
        "username": username,
        "userDomain": domain,
        "userProfile": user_profile,
        "computerDomain": computer_domain
    }