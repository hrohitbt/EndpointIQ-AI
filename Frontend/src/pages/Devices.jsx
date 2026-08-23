import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";

import {
  ArrowLeft,
  Search,
  Monitor,
  RefreshCw,
  ChevronRight,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const API_BASE = "http://127.0.0.1:8000";

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [healthData, setHealthData] = useState([]);

  const [searchParams, setSearchParams] =
    useSearchParams();

  const filter =
    searchParams.get("filter") || "all";

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDevices();
  }, []);

  /*
   * ============================================
   * LOAD DEVICE DATA
   * ============================================
   */

  async function loadDevices() {
    try {
      setLoading(true);

      const [
        devicesResponse,
        healthResponse,
      ] = await Promise.all([
        axios.get(`${API_BASE}/devices`),
        axios.get(`${API_BASE}/device-health`),
      ]);

      setDevices(
        devicesResponse.data?.devices || []
      );

      setHealthData(
        healthResponse.data?.devices || []
      );

    } catch (error) {

      console.error(
        "Failed to load EndpointIQ devices:",
        error
      );

    } finally {

      setLoading(false);

    }
  }


  /*
   * ============================================
   * MERGE DEVICE + HEALTH DATA
   * ============================================
   *
   * The device inventory comes from /devices.
   *
   * EndpointIQ calculated health comes from
   * /device-health.
   */

  const enrichedDevices = useMemo(() => {

    return devices.map((device) => {

      const health = healthData.find(
        (item) =>
          item.id === device.id ||
          item.deviceName === device.deviceName
      );

      return {
        ...device,
        healthScore:
          health?.healthScore ??
          calculateFallbackHealth(device),

        healthStatus:
          health?.healthStatus ??
          getFallbackStatus(device),

        reasons:
          health?.reasons || [],

        recommendations:
          health?.recommendations || [],
      };

    });

  }, [devices, healthData]);


  /*
   * ============================================
   * FILTER + SEARCH
   * ============================================
   */

  const filteredDevices = useMemo(() => {

    const text =
      search.toLowerCase().trim();

    return enrichedDevices.filter(
      (device) => {

        const compliance =
          (
            device.complianceState || ""
          ).toLowerCase();


        /*
         * Filter logic
         */

        let matchesFilter = true;


        if (filter === "noncompliant") {

          matchesFilter =
            compliance ===
            "noncompliant";

        }


        if (filter === "compliant") {

          matchesFilter =
            compliance ===
            "compliant";

        }


        if (filter === "critical") {

          matchesFilter =
            device.healthScore < 70;

        }


        /*
         * Search logic
         */

        const matchesSearch =
          (
            device.deviceName || ""
          )
            .toLowerCase()
            .includes(text) ||

          (
            device.userPrincipalName || ""
          )
            .toLowerCase()
            .includes(text) ||

          (
            device.emailAddress || ""
          )
            .toLowerCase()
            .includes(text) ||

          (
            device.operatingSystem || ""
          )
            .toLowerCase()
            .includes(text);


        return (
          matchesFilter &&
          matchesSearch
        );

      }
    );

  }, [
    enrichedDevices,
    filter,
    search,
  ]);


  /*
   * ============================================
   * PAGE TITLE
   * ============================================
   */

  const title =
    filter === "noncompliant"
      ? "Non-Compliant Devices"
      : filter === "compliant"
      ? "Compliant Devices"
      : filter === "critical"
      ? "Critical Devices"
      : "All Devices";


  /*
   * ============================================
   * FILTER BUTTON
   * ============================================
   */

  function changeFilter(value) {

    if (value === "all") {

      setSearchParams({});

    } else {

      setSearchParams({
        filter: value,
      });

    }

  }


  return (

    <div className="flex min-h-screen bg-slate-100">

      {/* ======================================
          SIDEBAR
      ======================================= */}

      <Sidebar />


      {/* ======================================
          MAIN AREA
      ======================================= */}

      <div className="flex-1 min-w-0">

        <Navbar />

        <main className="max-w-7xl mx-auto p-8">


          {/* ==================================
              HEADER
          =================================== */}

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

                  {title}

                </h1>

                <p className="text-slate-500 mt-1">

                  EndpointIQ managed endpoints

                </p>

              </div>


              {/* Refresh */}

              <button
                onClick={loadDevices}
                className="ml-auto bg-white border border-slate-200 p-3 rounded-xl hover:bg-slate-50"
                title="Refresh devices"
              >

                <RefreshCw size={20} />

              </button>

            </div>

          </div>


          {/* ==================================
              FILTERS
          =================================== */}

          <div className="flex flex-wrap gap-3 mb-6">

            <FilterButton
              label="All"
              active={filter === "all"}
              onClick={() =>
                changeFilter("all")
              }
            />

            <FilterButton
              label="Compliant"
              active={
                filter === "compliant"
              }
              onClick={() =>
                changeFilter(
                  "compliant"
                )
              }
            />

            <FilterButton
              label="Non-Compliant"
              active={
                filter === "noncompliant"
              }
              onClick={() =>
                changeFilter(
                  "noncompliant"
                )
              }
            />

            <FilterButton
              label="Critical"
              active={
                filter === "critical"
              }
              onClick={() =>
                changeFilter(
                  "critical"
                )
              }
            />

          </div>


          {/* ==================================
              SEARCH + COUNT
          =================================== */}

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
                  placeholder="Search device or user..."
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  className="w-full border border-slate-300 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

            </div>

          </div>


          {/* ==================================
              DEVICE TABLE
          =================================== */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

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

                    <th className="px-6 py-4 text-left">
                      Last Sync
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

                        Loading EndpointIQ devices...

                      </td>

                    </tr>

                  ) : filteredDevices.length === 0 ? (

                    <tr>

                      <td
                        colSpan="7"
                        className="px-6 py-12 text-center text-slate-500"
                      >

                        No devices found.

                      </td>

                    </tr>

                  ) : (

                    filteredDevices.map(
                      (device) => (

                        <DeviceRow
                          key={device.id}
                          device={device}
                        />

                      )
                    )

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


/*
 * ============================================
 * DEVICE ROW
 * ============================================
 */

function DeviceRow({
  device,
}) {

  const deviceName =
    device.deviceName ||
    "Unknown Device";


  const user =
    device.userPrincipalName ||
    device.emailAddress ||
    "Unassigned";


  const compliance =
    (
      device.complianceState ||
      ""
    ).toLowerCase();


  const healthScore =
    device.healthScore;


  const healthStatus =
    device.healthStatus ||
    getFallbackStatus(device);


  const lastSync =
    device.lastSyncDateTime;


  /*
   * First EndpointIQ reason
   */

  const reason =
    device.reasons?.[0] ||
    getDefaultReason(device);


  return (

    <tr
      className="border-b border-slate-100 hover:bg-blue-50 cursor-pointer transition"
      onClick={() => {
        window.location.href =
          `/device/${encodeURIComponent(
            deviceName
          )}`;
      }}
    >


      {/* Device */}

      <td className="px-6 py-4">

        <div>

          <p className="font-semibold text-blue-600">

            {deviceName}

          </p>

          <p className="text-xs text-slate-400 mt-1">

            {device.id}

          </p>

        </div>

      </td>


      {/* User */}

      <td className="px-6 py-4 text-slate-600">

        {user}

      </td>


      {/* OS */}

      <td className="px-6 py-4">

        <p className="text-slate-700">

          {device.operatingSystem ||
            "Unknown"}

        </p>

        {device.osVersion && (

          <p className="text-xs text-slate-400 mt-1">

            {device.osVersion}

          </p>

        )}

      </td>


      {/* Compliance */}

      <td className="px-6 py-4">

        {compliance ===
        "compliant" ? (

          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold text-sm">

            🟢 Compliant

          </span>

        ) : compliance ===
          "noncompliant" ? (

          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-semibold text-sm">

            🔴 Non-Compliant

          </span>

        ) : (

          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-semibold text-sm">

            🟡 {device.complianceState ||
              "Unknown"}

          </span>

        )}

      </td>


      {/* Health */}

      <td className="px-6 py-4">

        <div className="flex flex-col gap-1">

          <span
            className={`w-fit px-3 py-1 rounded-full font-semibold text-sm ${
              healthScore >= 90
                ? "bg-green-100 text-green-700"
                : healthScore >= 70
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }`}
          >

            {healthScore >= 90
              ? "🟢"
              : healthScore >= 70
              ? "🟡"
              : "🔴"}

            {" "}

            {healthScore}/100

          </span>


          <span className="text-xs text-slate-500">

            {healthStatus}

          </span>

        </div>

      </td>


      {/* Last Sync */}

      <td className="px-6 py-4">

        <div>

          <p className="text-slate-700 text-sm">

            {formatLastSync(
              lastSync
            )}

          </p>


          {reason && (

            <p className="text-xs text-slate-400 mt-1 max-w-xs truncate">

              {reason}

            </p>

          )}

        </div>

      </td>


      {/* Arrow */}

      <td className="px-6 py-4 text-right">

        <ChevronRight
          size={20}
          className="text-slate-400"
        />

      </td>

    </tr>

  );
}


/*
 * ============================================
 * FILTER BUTTON
 * ============================================
 */

function FilterButton({
  label,
  active,
  onClick,
}) {

  return (

    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-xl font-medium transition ${
        active
          ? "bg-blue-600 text-white shadow"
          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
      }`}
    >

      {label}

    </button>

  );
}


/*
 * ============================================
 * FALLBACK HEALTH
 * ============================================
 */

function calculateFallbackHealth(
  device
) {

  let score = 100;


  if (
    device.complianceState !==
    "compliant"
  ) {

    score -= 30;

  }


  if (
    device.operatingSystem &&
    device.operatingSystem.toLowerCase() !==
      "windows"
  ) {

    score -= 10;

  }


  return Math.max(
    0,
    score
  );
}


/*
 * ============================================
 * FALLBACK STATUS
 * ============================================
 */

function getFallbackStatus(
  device
) {

  const score =
    calculateFallbackHealth(
      device
    );


  if (score >= 90)
    return "Healthy";

  if (score >= 70)
    return "Warning";

  return "Critical";
}


/*
 * ============================================
 * DEFAULT REASON
 * ============================================
 */

function getDefaultReason(
  device
) {

  if (
    device.complianceState !==
    "compliant"
  ) {

    return "Device is non-compliant";

  }

  return "No immediate issues detected";

}


/*
 * ============================================
 * LAST SYNC
 * ============================================
 */

function formatLastSync(
  value
) {

  if (!value)
    return "Unknown";


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "Unknown";

  }


  const now =
    new Date();


  const diff =
    now.getTime() -
    date.getTime();


  const hours =
    Math.floor(
      diff /
        (1000 * 60 * 60)
    );


  if (hours < 1)
    return "Recently";


  if (hours < 24)
    return `${hours}h ago`;


  const days =
    Math.floor(
      hours / 24
    );


  return `${days}d ago`;

}