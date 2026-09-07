import json
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
CONFIG_FILE = BASE_DIR / "config" / "agent_config.json"

DEFAULTS = {
    "apiUrl": "http://127.0.0.1:8001",
    "agentKey": "dev-agent-key-change-me",
    "intervalSeconds": 300,
}


def _load_file():
    if not CONFIG_FILE.exists():
        return {}
    try:
        return json.loads(CONFIG_FILE.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}


def load_config():
    """
    Precedence: config/agent_config.json (written by install.ps1) ->
    env vars -> hardcoded dev defaults. This lets install.ps1 make the
    agent work on a fresh machine with no env vars set at all.
    """
    file_config = _load_file()

    return {
        "apiUrl": (
            file_config.get("apiUrl")
            or os.environ.get("ENDPOINTIQ_API_URL")
            or DEFAULTS["apiUrl"]
        ),
        "agentKey": (
            file_config.get("agentKey")
            or os.environ.get("ENDPOINTIQ_AGENT_KEY")
            or DEFAULTS["agentKey"]
        ),
        "intervalSeconds": int(
            file_config.get("intervalSeconds")
            or os.environ.get("ENDPOINTIQ_COLLECTION_INTERVAL")
            or DEFAULTS["intervalSeconds"]
        ),
    }
