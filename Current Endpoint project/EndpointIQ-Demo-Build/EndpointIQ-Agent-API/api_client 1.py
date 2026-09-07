import os
import requests

API_URL = os.environ.get("ENDPOINTIQ_API_URL", "http://192.168.29.200:8001")
AGENT_API_KEY = os.environ.get("ENDPOINTIQ_AGENT_KEY", "dev-agent-key-change-me")


def send_device_data(data):
    try:
        response = requests.post(
            f"{API_URL}/api/agent/telemetry",
            json={"data": data},
            headers={"X-Agent-Key": AGENT_API_KEY},
            timeout=30,
            verify=False
        )

        print("API Status:", response.status_code)
        print("API Response:", response.text)

        return response.ok

    except Exception as e:
        print("API Error:", str(e))
        return False
