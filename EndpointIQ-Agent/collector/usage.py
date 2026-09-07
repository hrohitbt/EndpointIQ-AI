import psutil

# OS/service-host processes that don't represent an "app" a user would
# recognize as something they used — excluded so usage ranking reflects
# actual user-facing activity, matching what Nexthink-style app-usage
# tracking reports.
_NOISE = {
    "system", "system idle process", "registry", "smss", "csrss",
    "wininit", "services", "lsass", "svchost", "conhost", "dwm",
    "winlogon", "fontdrvhost", "sihost", "ctfmon", "memcompression",
    "runtimebroker", "searchindexer", "audiodg", "spoolsv", "taskhostw",
    "wmiprvse", "wudfhost", "dllhost", "backgroundtaskhost",
}


def collect_running_processes():
    """
    One snapshot of currently-running, user-facing process names.
    This is the raw signal the API accumulates across collection cycles
    to rank "most-used" applications by observed frequency — the agent
    doesn't do continuous focus-time tracking, so frequency-of-observation
    across 5-minute snapshots is the honest proxy available today.
    """
    names = set()

    try:
        for proc in psutil.process_iter(["name"]):
            name = (proc.info.get("name") or "").strip()
            if not name:
                continue
            key = name.lower().removesuffix(".exe")
            if key in _NOISE:
                continue
            names.add(name)
    except Exception:
        return []

    return sorted(names)
