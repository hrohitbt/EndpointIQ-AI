import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import axios from "axios";

import Sidebar from "../components/Sidebar";

const API_BASE = "http://127.0.0.1:8000";

export default function Analytics() {

  const [summary, setSummary] = useState(null);
  const [health, setHealth] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {

    setLoading(true);

    try {

      const [
        summaryResponse,
        healthResponse,
      ] = await Promise.all([

        axios.get(
          `${API_BASE}/summary`
        ),

        axios.get(
          `${API_BASE}/device-health`
        ),

      ]);

      setSummary(
        summaryResponse.data
      );

      setHealth(
        healthResponse.data?.devices || []
      );

    } catch (error) {

      console.error(
        "Analytics error:",
        error
      );

    } finally {

      setLoading(false);

    }
  };


  const healthy = health.filter(
    (device) =>
      device.healthStatus === "Healthy"
  ).length;

  const warning = health.filter(
    (device) =>
      device.healthStatus === "Warning"
  ).length;

  const critical = health.filter(
    (device) =>
      device.healthStatus === "Critical"
  ).length;


  return (

    <div className="min-h-screen flex bg-slate-100">

      <Sidebar />

      <main className="flex-1 min-w-0 p-8">

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-blue-600 mb-6 hover:text-blue-800"
        >
          <ArrowLeft size={18} />
          Dashboard
        </Link>


        {/* Header */}

        <div className="flex items-center gap-4 mb-8">

          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">

            <BarChart3 size={28} />

          </div>

          <div>

            <h1 className="text-3xl font-bold">
              Analytics
            </h1>

            <p className="text-slate-500 mt-1">
              Endpoint health and fleet analytics
            </p>

          </div>

          <button
            onClick={loadAnalytics}
            className="ml-auto p-3 rounded-xl bg-white border hover:bg-slate-50"
            title="Refresh"
          >

            <RefreshCw size={20} />

          </button>

        </div>


        {loading ? (

          <div className="bg-white rounded-2xl p-10 text-center text-slate-500">
            Loading analytics from EndpointIQ...
          </div>

        ) : (

          <>

            {/* KPI */}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">

              <Card
                label="Managed Devices"
                value={
                  summary?.totalDevices ?? 0
                }
              />

              <Card
                label="Compliance"
                value={`${summary?.compliance ?? 0}%`}
              />

              <Card
                label="Healthy"
                value={healthy}
              />

              <Card
                label="Critical"
                value={critical}
              />

            </div>


            {/* Health */}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7">

              <h2 className="text-xl font-bold mb-6">
                Endpoint Health Distribution
              </h2>

              <HealthBar
                label="Healthy"
                value={healthy}
                total={health.length}
              />

              <HealthBar
                label="Warning"
                value={warning}
                total={health.length}
              />

              <HealthBar
                label="Critical"
                value={critical}
                total={health.length}
              />

            </div>

          </>

        )}

      </main>

    </div>

  );
}


function Card({ label, value }) {

  return (

    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">

      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="text-3xl font-bold mt-2">
        {value}
      </p>

    </div>

  );
}


function HealthBar({
  label,
  value,
  total,
}) {

  const percentage =
    total > 0
      ? Math.round(
          (value / total) * 100
        )
      : 0;

  return (

    <div className="mb-6">

      <div className="flex justify-between mb-2">

        <span className="font-medium">
          {label}
        </span>

        <span className="font-semibold">
          {value} ({percentage}%)
        </span>

      </div>

      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">

        <div
          className="h-full bg-blue-600 rounded-full transition-all"
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

    </div>

  );
}