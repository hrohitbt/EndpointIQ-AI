from fastapi import FastAPI, HTTPException
from requests.exceptions import RequestException
from fastapi.middleware.cors import CORSMiddleware

from Backend.graph_client import get_managed_devices
from Backend.health import calculate_health
from Backend.summary import generate_summary

app = FastAPI(
    title="EndpointIQ API",
    description="AI-powered Endpoint Intelligence API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------------------
# Root
# -----------------------------------------
@app.get("/")
def root():
    return {
        "message": "EndpointIQ API is running",
        "status": "healthy"
    }


# -----------------------------------------
# All Devices
# -----------------------------------------
@app.get("/devices")
def devices():
    try:
        data = get_managed_devices()
        devices_list = data.get("value", [])

        return {
            "status": "success",
            "device_count": len(devices_list),
            "devices": devices_list
        }

    except RequestException as error:
        raise HTTPException(
            status_code=502,
            detail=f"Microsoft Graph request failed: {error}"
        )


# -----------------------------------------
# Single Device
# -----------------------------------------
@app.get("/device/{device_name}")
def device(device_name: str):
    try:
        data = get_managed_devices()
        devices = data.get("value", [])

        for d in devices:

            if d.get("deviceName", "").lower() == device_name.lower():

                health = calculate_health(d)

                d["healthScore"] = health["healthScore"]

                return {
                    "status": "success",
                    "device": d
                }

        raise HTTPException(
            status_code=404,
            detail="Device not found"
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# -----------------------------------------
# Search
# -----------------------------------------
@app.get("/search")
def search(name: str):

    data = get_managed_devices()

    devices = data.get("value", [])

    results = []

    for d in devices:

        if name.lower() in d.get("deviceName", "").lower():
            results.append(d)

    return {
        "count": len(results),
        "devices": results
    }


# -----------------------------------------
# Windows Devices
# -----------------------------------------
@app.get("/windows")
def windows():

    data = get_managed_devices()

    devices = [
        d for d in data.get("value", [])
        if d.get("operatingSystem", "").lower() == "windows"
    ]

    return {
        "count": len(devices),
        "devices": devices
    }


# -----------------------------------------
# Android Devices
# -----------------------------------------
@app.get("/android")
def android():

    data = get_managed_devices()

    devices = [
        d for d in data.get("value", [])
        if d.get("operatingSystem", "").lower() == "android"
    ]

    return {
        "count": len(devices),
        "devices": devices
    }


# -----------------------------------------
# iOS Devices
# -----------------------------------------
@app.get("/ios")
def ios():

    data = get_managed_devices()

    devices = [
        d for d in data.get("value", [])
        if d.get("operatingSystem", "").lower() == "ios"
    ]

    return {
        "count": len(devices),
        "devices": devices
    }


# -----------------------------------------
# macOS Devices
# -----------------------------------------
@app.get("/macos")
def macos():

    data = get_managed_devices()

    devices = [
        d for d in data.get("value", [])
        if d.get("operatingSystem", "").lower() == "macos"
    ]

    return {
        "count": len(devices),
        "devices": devices
    }


# -----------------------------------------
# Compliant Devices
# -----------------------------------------
@app.get("/compliant")
def compliant():

    data = get_managed_devices()

    devices = [
        d for d in data.get("value", [])
        if d.get("complianceState", "").lower() == "compliant"
    ]

    return {
        "count": len(devices),
        "devices": devices
    }


# -----------------------------------------
# Non-Compliant Devices
# -----------------------------------------
@app.get("/noncompliant")
def noncompliant():

    data = get_managed_devices()

    devices = [
        d for d in data.get("value", [])
        if d.get("complianceState", "").lower() != "compliant"
    ]

    return {
        "count": len(devices),
        "devices": devices
    }


# -----------------------------------------
# Device Health
# -----------------------------------------
@app.get("/device-health")
def device_health():
    try:

        data = get_managed_devices()

        devices = data.get("value", [])

        results = []

        for d in devices:
            results.append(calculate_health(d))

        return {
            "status": "success",
            "device_count": len(results),
            "devices": results
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# -----------------------------------------
# Environment Summary
# -----------------------------------------
@app.get("/summary")
def summary():
    try:

        data = get_managed_devices()

        devices = data.get("value", [])

        health_devices = []

        for d in devices:

            health = calculate_health(d)

            d["healthScore"] = health["healthScore"]

            health_devices.append(d)

        return {
            "status": "success",
            "summary": generate_summary(health_devices)
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )