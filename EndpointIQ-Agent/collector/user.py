import os
import re
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


def collect_logged_in_users():
    """
    Parses `quser` (fixed-width columns, 2+ spaces apart). The active
    session's username is prefixed with '>' in the raw output.
    """
    output = run_command("quser")

    if not output:
        return []

    lines = [line for line in output.splitlines() if line.strip()]

    if len(lines) < 2:
        return []

    users = []

    for line in lines[1:]:
        columns = re.split(r"\s{2,}", line.strip())

        if not columns:
            continue

        username = columns[0].lstrip(">").strip()

        users.append({
            "username": username,
            "sessionName": columns[1] if len(columns) > 1 else None,
            "state": columns[3] if len(columns) > 3 else None,
            "logonTime": columns[-1] if len(columns) > 4 else None,
        })

    return users


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
        "computerDomain": computer_domain,
        "loggedInUsers": collect_logged_in_users(),
    }
