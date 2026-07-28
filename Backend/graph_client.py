import truststore

truststore.inject_into_ssl()

import msal
import requests

from Backend.config import (
    TENANT_ID,
    CLIENT_ID,
    CLIENT_SECRET,
    GRAPH_BASE_URL,
    validate_config,
)


def get_access_token():
    validate_config()

    authority = f"https://login.microsoftonline.com/{TENANT_ID}"

    app = msal.ConfidentialClientApplication(
        client_id=CLIENT_ID,
        authority=authority,
        client_credential=CLIENT_SECRET,
    )

    token_result = app.acquire_token_for_client(
        scopes=["https://graph.microsoft.com/.default"]
    )

    if "access_token" not in token_result:
        error = token_result.get("error", "unknown_error")
        description = token_result.get(
            "error_description",
            "No error description returned."
        )

        raise RuntimeError(
            f"Failed to acquire Microsoft Graph token:\n"
            f"Error: {error}\n"
            f"Description: {description}"
        )

    return token_result["access_token"]


def get_managed_devices():
    token = get_access_token()

    url = f"{GRAPH_BASE_URL}/deviceManagement/managedDevices"

    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
    }

    response = requests.get(
        url,
        headers=headers,
        timeout=30,
    )

    response.raise_for_status()

    return response.json()