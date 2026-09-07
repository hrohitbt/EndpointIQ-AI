import requests

from config import load_config


def send_device_data(data):
    config = load_config()

    try:
        response = requests.post(
            f"{config['apiUrl']}/api/agent/telemetry",
            json={"data": data},
            headers={"X-Agent-Key": config["agentKey"]},
            timeout=30,
        )

        print("API Status:", response.status_code)
        print("API Response:", response.text)

        return response.ok

    except Exception as e:
        print("API Error:", str(e))
        return False
