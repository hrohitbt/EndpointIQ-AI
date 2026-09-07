import json
import socket
import subprocess


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


def collect_network_info():

    # Network adapters
    adapters_raw = run_powershell(
        "Get-NetAdapter | "
        "Where-Object {$_.Status -eq 'Up'} | "
        "Select-Object Name,InterfaceDescription,MacAddress,LinkSpeed,Status | "
        "ConvertTo-Json -Compress"
    )

    adapters = parse_json(adapters_raw)

    if isinstance(adapters, dict):
        adapters = [adapters]

    # IP configuration
    ip_raw = run_powershell(
        "Get-NetIPConfiguration | "
        "Where-Object {$_.IPv4Address -ne $null} | "
        "Select-Object InterfaceAlias,"
        "@{Name='IPv4Address';Expression={$_.IPv4Address.IPAddress}},"
        "@{Name='Gateway';Expression={$_.IPv4DefaultGateway.NextHop}},"
        "@{Name='DNSServers';Expression={$_.DNSServer.ServerAddresses}} | "
        "ConvertTo-Json -Compress"
    )

    ip_config = parse_json(ip_raw)

    if isinstance(ip_config, dict):
        ip_config = [ip_config]

    # Hostname
    hostname = socket.gethostname()

    return {
        "hostname": hostname,
        "adapters": adapters or [],
        "ipConfiguration": ip_config or []
    }