import logging
import os
import sys
import time

import servicemanager
import win32event
import win32service
import win32serviceutil

from agent import collect_endpoint_data
from api_client import send_device_data
from config import load_config


SERVICE_NAME = "EndpointIQAgentV2"
SERVICE_DISPLAY_NAME = "EndpointIQ Agent"
SERVICE_DESCRIPTION = (
    "Collects endpoint telemetry and sends it to the Endpoint IQ platform."
)

COLLECTION_INTERVAL = load_config()["intervalSeconds"]


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_DIR = os.path.join(BASE_DIR, "logs")
LOG_FILE = os.path.join(LOG_DIR, "endpointiq-agent.log")


def setup_logging():

    os.makedirs(LOG_DIR, exist_ok=True)

    logging.basicConfig(
        filename=LOG_FILE,
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(message)s"
    )


def collect_and_send():

    logging.info("Starting endpoint telemetry collection.")

    try:

        data = collect_endpoint_data()

        logging.info(
            "Endpoint telemetry collected successfully."
        )

        success = send_device_data(data)

        if success:

            logging.info(
                "Telemetry successfully sent to Endpoint IQ API."
            )

        else:

            logging.error(
                "Telemetry failed to send to Endpoint IQ API."
            )

    except Exception:

        logging.exception(
            "Error during endpoint telemetry collection."
        )


class EndpointIQAgentService(
    win32serviceutil.ServiceFramework
):

    _svc_name_ = SERVICE_NAME
    _svc_display_name_ = SERVICE_DISPLAY_NAME
    _svc_description_ = SERVICE_DESCRIPTION

    def __init__(self, args):

        win32serviceutil.ServiceFramework.__init__(
            self,
            args
        )

        self.stop_event = win32event.CreateEvent(
            None,
            0,
            0,
            None
        )

        self.running = True

        setup_logging()

        logging.info(
            "Endpoint IQ Agent Service initialized."
        )

    def SvcStop(self):

        logging.info(
            "Endpoint IQ Agent Service stopping."
        )

        self.ReportServiceStatus(
            win32service.SERVICE_STOP_PENDING
        )

        self.running = False

        win32event.SetEvent(
            self.stop_event
        )

    def SvcDoRun(self):

        setup_logging()

        logging.info(
            "Endpoint IQ Agent Service starting."
        )

        servicemanager.LogInfoMsg(
            "Endpoint IQ Agent Service starting."
        )

        self.ReportServiceStatus(
            win32service.SERVICE_RUNNING
        )

        logging.info(
            "Endpoint IQ Agent Service is RUNNING."
        )

        self.main()

    def main(self):

        # Run immediately after service starts.
        collect_and_send()

        while self.running:

            logging.info(
                "Waiting %s seconds until next collection.",
                COLLECTION_INTERVAL
            )

            result = win32event.WaitForSingleObject(
                self.stop_event,
                COLLECTION_INTERVAL * 1000
            )

            if result == win32event.WAIT_OBJECT_0:

                break

            if not self.running:

                break

            collect_and_send()

        logging.info(
            "Endpoint IQ Agent Service stopped."
        )


if __name__ == "__main__":

    if len(sys.argv) > 1 and sys.argv[1].lower() == "test":

        setup_logging()

        logging.info(
            "Endpoint IQ Agent foreground test started."
        )

        collect_and_send()

        print(
            "Endpoint IQ Agent test completed."
        )

    else:

        win32serviceutil.HandleCommandLine(
            EndpointIQAgentService
        )