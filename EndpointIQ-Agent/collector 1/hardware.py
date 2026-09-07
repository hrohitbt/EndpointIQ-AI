import platform
import psutil


def collect_hardware_info():
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage("C:\\")

    return {
        "processor": platform.processor(),
        "architecture": platform.machine(),
        "ramTotalGB": round(memory.total / (1024 ** 3), 2),
        "ramAvailableGB": round(memory.available / (1024 ** 3), 2),
        "ramUsagePercent": memory.percent,
        "diskTotalGB": round(disk.total / (1024 ** 3), 2),
        "diskFreeGB": round(disk.free / (1024 ** 3), 2),
        "diskUsagePercent": disk.percent
    }