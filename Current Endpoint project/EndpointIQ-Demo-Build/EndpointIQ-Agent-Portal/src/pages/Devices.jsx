import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Search,
  Monitor,
  RefreshCw,
  ChevronRight,
  Server,
  ShieldCheck,
  Package,
  Wrench,
  Cpu,
  Wifi,
  User,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const API_BASE = "http://127.0.0.1:8001/api/agent";

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDevices();
  }, []);

  async function loadDevices() {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_BASE}/devices`,
        { timeout: 15000 }
      );

      setDevices(response.data?.devices || []);
    } catch (err) {
      console.error("Failed to load Agent devices:", err);

      setError(
        err.response?.data?.detail ||
        "Unable to connect to EndpointIQ Agent API."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredDevices = useMemo(() => {
    const text = search.toLowerCase().trim();

    if (!text) {
      return devices;
    }

    return devices.filter((device) => {
      const deviceName =
        device.deviceName || "";

      const os =
        device.os || "";

      const osVersion =
        device.osVersion || "";

      const architecture =
        device.architecture || "";

      return (
        deviceName.toLowerCase().includes(text) ||
        os.toLowerCase().includes(text) ||
        osVersion.toLowerCase().includes(text) ||
        architecture.toLowerCase().includes(text)
      );
    });
  }, [devices, search]);

  return (
    <div className="flex min-h-screen bg-slate-100">

      <Sidebar />

      <div className="flex-1 min-w-0">

        <Navbar />

        <main className="max-w-7xl mx-auto p-8">

          <div className="mb-8">

            <Link
              to="/"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-5"
            >
              <ArrowLeft size={18} />
              Back to Dashboard
            </Link>

            <div className="flex items-center gap-3">

              <div className="bg-blue-100 p-3 rounded-xl">
                <Monitor
                  size={28}
                  className="text-blue-600"
                />
              </div>

              <div>

                <h1 className="text-3xl font-bold text-slate-900">
                  Agent Devices
                </h1>

                <p className="text-slate-500 mt-1">
                  Devices reporting directly through EndpointIQ Agent
                </p>

              </div>

              <button
                onClick={loadDevices}
                className="ml-auto bg-white border border-slate-200 p-3 rounded-xl hover:bg-slate-50"
                title="Refresh devices"
              >
                <RefreshCw size={20} />
              </button>

            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

            <StatCard
              icon={<Server size={22} />}
              label="Agent Devices"
              value={devices.length}
            />

            <StatCard
              icon={<Package size={22} />}
              label="Applications"
              value={devices.reduce(
                (total, device) =>
                  total + (device.applications?.length || 0),
                0
              )}
            />

            <StatCard
              icon={<Wrench size={22} />}
              label="Services"
              value={devices.reduce(
                (total, device) =>
                  total + (device.services?.length || 0),
                0
              )}
            />

            <StatCard
              icon={<ShieldCheck size={22} />}
              label="Reporting"
              value={devices.length}
            />

          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">

            <div className="flex items-center justify-between gap-6">

              <div>
                <p className="text-sm text-slate-500">
                  Devices found
                </p>

                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {filteredDevices.length}
                </p>
              </div>

              <div className="relative w-96">

                <Search
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  placeholder="Search device..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  className="w-full border border-slate-300 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

            </div>

          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-5 mb-6">
              <p className="font-semibold">
                Agent API connection failed
              </p>

              <p className="text-sm mt-1">
                {error}
              </p>

              <p className="text-xs mt-2 text-red-500">
                Make sure EndpointIQ-Agent-API is running on port 8001.
              </p>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead className="bg-slate-800 text-white">

                  <tr>

                    <th className="px-6 py-4 text-left">
                      Device
                    </th>

                    <th className="px-6 py-4 text-left">
                      Operating System
                    </th>

                    <th className="px-6 py-4 text-left">
                      Hardware
                    </th>

                    <th className="px-6 py-4 text-left">
                      Applications
                    </th>

                    <th className="px-6 py-4 text-left">
                      Services
                    </th>

                    <th className="px-6 py-4 text-left">
                      Last Seen
                    </th>

                    <th className="px-6 py-4">
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {loading ? (

                    <tr>
                      <td
                        colSpan="7"
                        className="px-6 py-12 text-center text-slate-500"
                      >
                        Loading Agent devices...
                      </td>
                    </tr>

                  ) : filteredDevices.length === 0 ? (

                    <tr>
                      <td
                        colSpan="7"
                        className="px-6 py-12 text-center text-slate-500"
                      >
                        No Agent devices found.
                      </td>
                    </tr>

                  ) : (

                    filteredDevices.map((device) => (
                      <DeviceRow
                        key={
                          device.deviceName ||
                          device.collectionTime
                        }
                        device={device}
                      />
                    ))

                  )}

                </tbody>

              </table>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}


function DeviceRow({ device }) {

  const deviceName =
    device.deviceName || "Unknown Device";

  const applicationCount =
    device.applications?.length || 0;

  const serviceCount =
    device.services?.length || 0;

  const hardware =
    device.hardware || {};

  const manufacturer =
    hardware.manufacturer ||
    hardware.Manufacturer ||
    "Unknown";

  const model =
    hardware.model ||
    hardware.Model ||
    "Unknown";

  const os =
    device.os || "Windows";

  const osVersion =
    device.osVersion || "Unknown";

  const lastSeen =
    device.agentLastSeen ||
    device.collectionTime;

  return (

    <tr className="border-b border-slate-100 hover:bg-blue-50 transition">

      <td className="px-6 py-5">

        <div className="flex items-center gap-3">

          <div className="bg-blue-100 p-2 rounded-lg">
            <Monitor
              size={20}
              className="text-blue-600"
            />
          </div>

          <div>

            <p className="font-semibold text-blue-600">
              {deviceName}
            </p>

            <p className="text-xs text-slate-400 mt-1">
              EndpointIQ Agent
            </p>

          </div>

        </div>

      </td>


      <td className="px-6 py-5">

        <p className="font-medium text-slate-700">
          {os}
        </p>

        <p className="text-xs text-slate-400 mt-1">
          {osVersion}
        </p>

      </td>


      <td className="px-6 py-5">

        <div className="flex items-center gap-2">

          <Cpu
            size={17}
            className="text-slate-400"
          />

          <div>

            <p className="text-slate-700">
              {manufacturer}
            </p>

            <p className="text-xs text-slate-400">
              {model}
            </p>

          </div>

        </div>

      </td>


      <td className="px-6 py-5">

        <div className="flex items-center gap-2">

          <Package
            size={17}
            className="text-slate-400"
          />

          <span className="font-semibold text-slate-700">
            {applicationCount}
          </span>

        </div>

      </td>


      <td className="px-6 py-5">

        <div className="flex items-center gap-2">

          <Wrench
            size={17}
            className="text-slate-400"
          />

          <span className="font-semibold text-slate-700">
            {serviceCount}
          </span>

        </div>

      </td>


      <td className="px-6 py-5">

        <div>

          <p className="text-slate-700 text-sm">
            {formatLastSeen(lastSeen)}
          </p>

          <p className="text-xs text-green-600 mt-1">
            Agent reporting
          </p>

        </div>

      </td>


      <td className="px-6 py-5 text-right">

        <Link
          to={`/device/${encodeURIComponent(deviceName)}`}
          className="inline-flex"
        >

          <ChevronRight
            size={20}
            className="text-slate-400"
          />

        </Link>

      </td>

    </tr>
  );
}


function StatCard({
  icon,
  label,
  value,
}) {

  return (

    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-slate-500">
            {label}
          </p>

          <p className="text-2xl font-bold text-slate-900 mt-1">
            {value}
          </p>

        </div>

        <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
          {icon}
        </div>

      </div>

    </div>
  );
}


function formatLastSeen(value) {

  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  const now = new Date();

  const diff =
    now.getTime() -
    date.getTime();

  const minutes =
    Math.floor(
      diff / (1000 * 60)
    );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours =
    Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days =
    Math.floor(hours / 24);

  return `${days}d ago`;
}
