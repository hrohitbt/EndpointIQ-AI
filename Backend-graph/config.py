import os
from dotenv import load_dotenv

load_dotenv()

TENANT_ID = os.getenv("TENANT_ID")
CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")

GRAPH_BASE_URL = "https://graph.microsoft.com/v1.0"


def validate_config():
    missing = []

    if not TENANT_ID:
        missing.append("TENANT_ID")

    if not CLIENT_ID:
        missing.append("CLIENT_ID")

    if not CLIENT_SECRET:
        missing.append("CLIENT_SECRET")

    if missing:
        raise ValueError(
            f"Missing environment variables: {', '.join(missing)}"
        )