import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import AIAssistant from "../components/AIAssistant";
import ExecutiveSummary from "../components/ExecutiveSummary";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import DevicePieChart from "../charts/DevicePieChart";
import WindowsVersionChart from "../charts/WindowsVersionChart";
import HealthTrend from "../charts/HealthTrend";
import ComplianceTrend from "../charts/ComplianceTrend";

function Dashboard() {
  const [devices, setDevices] = useState([]);
  const [search, setSearch] = useState("");

  const [summary, setSummary] = useState({
    totalDevices: 0,
    healthyDevices: 0,
    unhealthyDevices: 0,
    windows11: 0,
    windows10: 0,
    compliance: 0,
  });

  useEffect(() => {
    loadDevices();
    loadSummary();
  }, []);

  async function loadDevices() {
    try {
      const res = await axios.get("http://127.0.0.1:8000/devices");
      setDevices(res.data.devices || []);
    } catch (err) {
      console.error("Failed to load devices:", err);
    }
  }

  async function loadSummary() {
    try {
      const res = await axios.get("http://127.0.0.1:8000/summary");
      setSummary(res.data);
    } catch (err) {
      console.error("Failed to load summary:", err);
    }
  }

  const filteredDevices = useMemo(() => {
    const text = search.toLowerCase();

    return devices.filter((device) => {
      return (
        (device.deviceName || "").toLowerCase().includes(text) ||
        (device.userPrincipalName || "").toLowerCase().includes(text) ||
        (device.emailAddress || "").toLowerCase().includes(text) ||
        (device.operatingSystem || "").toLowerCase().includes(text)
      );
    });
  }, [devices, search]);

  const getHealthScore = (device) => {
    switch (device.complianceState) {
      case "compliant":
        return 100;

      case "noncompliant":
        return 40;

      default:
        return 70;
    }
  };

  const overallHealth =
    summary.totalDevices > 0
      ? Math.round(
          (summary.healthyDevices / summary.totalDevices) * 100
        )
      : 0;

  return (
    <div className="flex min-h-screen bg-slate-100">

      {/* LEFT SIDEBAR */}
      <Sidebar />

      {/* MAIN AREA */}
      <div className="flex-1 min-w-0">

        <Navbar />

        <main className="max-w-7xl mx-auto p-8">

          {/* HEADER */}
          <div className="mb-8">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">
                  EndpointIQ
                </p>


                <p className="text-slate-500 mt-2">
                  Monitor your endpoint health, compliance and device
                  experience.
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-slate-400">
                  Last updated
                </p>

                <p className="text-sm font-medium text-slate-600">
                  Just now
                </p>
              </div>

            </div>

          </div>


          {/* KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

            {/* Devices */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">

              <p className="text-sm font-medium text-slate-500">
                My Devices
              </p>

              <div className="flex items-end justify-between mt-3">

                <p className="text-3xl font-bold text-slate-900">
                  {summary.totalDevices}
                </p>

                <span className="text-2xl">
                  💻
                </span>

              </div>

              <p className="text-xs text-slate-400 mt-2">
                Managed endpoints
              </p>

            </div>


            {/* Healthy */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">

              <p className="text-sm font-medium text-slate-500">
                Healthy
              </p>

              <div className="flex items-end justify-between mt-3">

                <p className="text-3xl font-bold text-green-600">
                  {summary.healthyDevices}
                </p>

                <span className="text-2xl">
                  🟢
                </span>

              </div>

              <p className="text-xs text-slate-400 mt-2">
                Healthy endpoints
              </p>

            </div>


            {/* Compliance */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">

              <p className="text-sm font-medium text-slate-500">
                Compliance
              </p>

              <div className="flex items-end justify-between mt-3">

                <p className="text-3xl font-bold text-blue-600">
                  {summary.compliance}%
                </p>

                <span className="text-2xl">
                  🛡️
                </span>

              </div>

              <p className="text-xs text-slate-400 mt-2">
                Overall compliance
              </p>

            </div>


            {/* Attention */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">

              <p className="text-sm font-medium text-slate-500">
                Attention Required
              </p>

              <div className="flex items-end justify-between mt-3">

                <p className="text-3xl font-bold text-orange-500">
                  {summary.unhealthyDevices}
                </p>

                <span className="text-2xl">
                  ⚠️
                </span>

              </div>

              <p className="text-xs text-slate-400 mt-2">
                Endpoints requiring attention
              </p>

            </div>

          </div>


          {/* HEALTH OVERVIEW + AI */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

            {/* Health Score */}
            <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">

              <div className="flex items-center justify-between">

                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Endpoint Health
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Overall device health
                  </p>
                </div>

                <span className="text-2xl">
                  ❤️
                </span>

              </div>

              <div className="flex items-center justify-center py-8">

                <div className="w-36 h-36 rounded-full border-[14px] border-blue-100 flex flex-col items-center justify-center">

                  <span className="text-3xl font-bold text-slate-900">
                    {overallHealth}
                  </span>

                  <span className="text-xs text-slate-500">
                    / 100
                  </span>

                </div>

              </div>

              <div className="text-center">

                {overallHealth >= 90 ? (
                  <span className="text-green-600 font-semibold">
                    Excellent endpoint health
                  </span>
                ) : overallHealth >= 70 ? (
                  <span className="text-yellow-600 font-semibold">
                    Some attention required
                  </span>
                ) : (
                  <span className="text-red-600 font-semibold">
                    Immediate attention required
                  </span>
                )}

              </div>

            </div>


            {/* AI Assistant */}
            <div className="lg:col-span-2">

              <AIAssistant />

            </div>

          </div>


          {/* EXISTING EXECUTIVE SUMMARY */}
          <div className="mb-8">
            <ExecutiveSummary />
          </div>


          {/* SEARCH */}
          <div className="mb-8">

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

              <label className="text-sm font-medium text-slate-700">
                Search My Devices
              </label>

              <input
                type="text"
                placeholder="Search by device, user or operating system..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full mt-3 rounded-xl border border-slate-300 bg-white p-4 outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

          </div>


          {/* CHARTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

            <DevicePieChart />

            <WindowsVersionChart />

          </div>


          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

            <HealthTrend />

            <ComplianceTrend />

          </div>


          {/* DEVICE TABLE */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            <div className="p-6 border-b border-slate-200">

              <h2 className="text-xl font-semibold text-slate-900">
                My Devices
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Devices currently managed by EndpointIQ
              </p>

            </div>


            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead className="bg-slate-800 text-white">

                  <tr>

                    <th className="px-6 py-4 text-left">
                      Device
                    </th>

                    <th className="px-6 py-4 text-left">
                      User
                    </th>

                    <th className="px-6 py-4 text-left">
                      Operating System
                    </th>

                    <th className="px-6 py-4 text-left">
                      Compliance
                    </th>

                    <th className="px-6 py-4 text-left">
                      Health
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredDevices.map((device) => (

                    <tr
                      key={device.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition"
                    >

                      <td className="px-6 py-4 font-semibold">

                        <Link
                          to={`/device/${encodeURIComponent(
                            device.deviceName
                          )}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {device.deviceName}
                        </Link>

                      </td>


                      <td className="px-6 py-4 text-slate-600">
                        {device.userPrincipalName ||
                          device.emailAddress ||
                          "Unassigned"}
                      </td>


                      <td className="px-6 py-4 text-slate-600">
                        {device.operatingSystem || "Unknown"}
                      </td>


                      <td className="px-6 py-4">
                        <ComplianceBadge
                          state={device.complianceState}
                        />
                      </td>


                      <td className="px-6 py-4">
                        <HealthBadge
                          score={getHealthScore(device)}
                        />
                      </td>

                    </tr>

                  ))}


                  {filteredDevices.length === 0 && (

                    <tr>

                      <td
                        colSpan="5"
                        className="px-6 py-12 text-center text-slate-500"
                      >
                        No devices found.
                      </td>

                    </tr>

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


/* Compliance Badge */

function ComplianceBadge({ state }) {

  switch (state) {

    case "compliant":

      return (
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold text-sm">
          🟢 Compliant
        </span>
      );

    case "noncompliant":

      return (
        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-semibold text-sm">
          🔴 Non-Compliant
        </span>
      );

    default:

      return (
        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-semibold text-sm">
          🟡 Unknown
        </span>
      );
  }
}


/* Health Badge */

function HealthBadge({ score }) {

  let colour = "";
  let icon = "";

  if (score >= 90) {

    colour = "bg-green-100 text-green-700";
    icon = "🟢";

  } else if (score >= 70) {

    colour = "bg-yellow-100 text-yellow-700";
    icon = "🟡";

  } else {

    colour = "bg-red-100 text-red-700";
    icon = "🔴";
  }

  return (
    <span
      className={`${colour} px-3 py-1 rounded-full font-semibold text-sm`}
    >
      {icon} {score}%
    </span>
  );
}


export default Dashboard;