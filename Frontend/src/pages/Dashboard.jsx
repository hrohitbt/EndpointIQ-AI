import { useEffect, useState } from "react";
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

  /*
   * ============================================
   * DASHBOARD SUMMARY
   * ============================================
   */

  const [summary, setSummary] = useState({
    totalDevices: 0,
    healthyDevices: 0,
    unhealthyDevices: 0,
    windows11: 0,
    windows10: 0,
    compliance: 0,
  });


  /*
   * ============================================
   * LOAD DASHBOARD DATA
   * ============================================
   */

  useEffect(() => {
    loadSummary();
  }, []);


  async function loadSummary() {

    try {

      const res = await axios.get(
        "http://127.0.0.1:8000/summary"
      );

      setSummary(res.data);

    } catch (err) {

      console.error(
        "Failed to load summary:",
        err
      );

    }

  }


  /*
   * ============================================
   * OVERALL HEALTH
   * ============================================
   *
   * This is based on the backend summary:
   *
   * healthy devices / total devices
   *
   * multiplied by 100.
   */

  const overallHealth =
    summary.totalDevices > 0
      ? Math.round(
          (summary.healthyDevices /
            summary.totalDevices) *
            100
        )
      : 0;


  /*
   * ============================================
   * DASHBOARD
   * ============================================
   */

  return (

    <div className="flex min-h-screen bg-slate-100">


      {/* ======================================
          LEFT SIDEBAR
      ======================================= */}

      <Sidebar />


      {/* ======================================
          MAIN AREA
      ======================================= */}

      <div className="flex-1 min-w-0">


        {/* ====================================
            TOP NAVBAR
        ===================================== */}

        <Navbar />


        {/* ====================================
            MAIN CONTENT
        ===================================== */}

        <main className="max-w-7xl mx-auto p-8">


          {/* ==================================
              HEADER
          =================================== */}

          <div className="mb-8">

            <div className="flex items-center justify-between">


              {/* LEFT */}

              <div>

                <p className="text-sm font-medium text-blue-600 mb-1">
                  EndpointIQ
                </p>


                <h1 className="text-2xl font-bold text-slate-900">
                  EndpointIQ Dashboard
                </h1>


                <p className="text-slate-500 mt-2">
                  Monitor your endpoint health,
                  compliance and device experience.
                </p>

              </div>


              {/* LAST UPDATED */}

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


          {/* ==================================
              KPI CARDS
          =================================== */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">


            {/* =================================
                MY DEVICES
            ================================== */}

            <div
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm cursor-pointer hover:shadow-md hover:border-blue-300 transition"
              onClick={() => {
                window.location.href =
                  "/devices";
              }}
            >

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


            {/* =================================
                HEALTHY
            ================================== */}

            <div
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm cursor-pointer hover:shadow-md hover:border-green-300 transition"
              onClick={() => {
                window.location.href =
                  "/devices?filter=compliant";
              }}
            >

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


            {/* =================================
                COMPLIANCE
            ================================== */}

            <div
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm cursor-pointer hover:shadow-md hover:border-blue-300 transition"
              onClick={() => {
                window.location.href =
                  "/devices?filter=compliant";
              }}
            >

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


            {/* =================================
                ATTENTION REQUIRED
            ================================== */}

            <div
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm cursor-pointer hover:shadow-md hover:border-orange-300 transition"
              onClick={() => {
                window.location.href =
                  "/devices?filter=noncompliant";
              }}
            >

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


          {/* ==================================
              HEALTH + AI ASSISTANT
          =================================== */}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">


            {/* =================================
                ENDPOINT HEALTH
            ================================== */}

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


              {/* SCORE */}

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


              {/* HEALTH STATUS */}

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


            {/* =================================
                AI ASSISTANT
            ================================== */}

            <div className="lg:col-span-2">

              <AIAssistant />

            </div>

          </div>


          {/* ==================================
              EXECUTIVE SUMMARY
          =================================== */}

          <div className="mb-8">

            <ExecutiveSummary />

          </div>


          {/* ==================================
              DEVICE / OS CHARTS
          =================================== */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

            <DevicePieChart />

            <WindowsVersionChart />

          </div>


          {/* ==================================
              HEALTH / COMPLIANCE TRENDS
          =================================== */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

            <HealthTrend />

            <ComplianceTrend />

          </div>


        </main>

      </div>

    </div>

  );
}


export default Dashboard;