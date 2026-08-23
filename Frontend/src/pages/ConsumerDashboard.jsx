import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Gauge,
  HardDrive,
  Laptop,
  Network,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Wifi,
  Zap,
} from "lucide-react";


export default function ConsumerDashboard() {

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");

  /*
   * =========================================================
   * DEMO DATA
   * =========================================================
   *
   * Later these values will come from EndpointIQ APIs.
   */

  const metrics = {
    dexScore: 87,
    devices: 12,
    healthy: 9,
    attention: 3,

    bootScore: 82,
    performanceScore: 88,
    connectivityScore: 94,

    memoryIssues: 2,
    notRebooted: 3,
    slowLogon: 2,
    applicationCrashes: 4,

    wifiGood: 9,
    wifiPoor: 3,

    teamsCrashes: 3,
    outlookCrashes: 2,
    edgeCrashes: 1,
  };


  /*
   * =========================================================
   * TAB DEFINITIONS
   * =========================================================
   */

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: Gauge,
    },

    {
      id: "experience",
      label: "Experience",
      icon: Activity,
    },

    {
      id: "performance",
      label: "Performance",
      icon: BarChart3,
    },

    {
      id: "connectivity",
      label: "Connectivity",
      icon: Network,
    },
  ];


  /*
   * =========================================================
   * HELPERS
   * =========================================================
   */

  function getScoreStatus(score) {

    if (score >= 90) {
      return {
        label: "Excellent",
        className: "text-green-600",
        bg: "bg-green-50",
      };
    }

    if (score >= 75) {
      return {
        label: "Good",
        className: "text-blue-600",
        bg: "bg-blue-50",
      };
    }

    if (score >= 60) {
      return {
        label: "Needs Attention",
        className: "text-yellow-600",
        bg: "bg-yellow-50",
      };
    }

    return {
      label: "Critical",
      className: "text-red-600",
      bg: "bg-red-50",
    };
  }


  const dexStatus =
    getScoreStatus(metrics.dexScore);


  /*
   * =========================================================
   * CLICKABLE KPI
   * =========================================================
   */

  function handleKpiClick(type) {

    if (type === "devices") {
      navigate("/devices");
      return;
    }

    if (type === "attention") {
      navigate("/devices?filter=attention");
      return;
    }

    if (type === "healthy") {
      navigate("/devices?filter=healthy");
      return;
    }

    setActiveTab("experience");
  }


  /*
   * =========================================================
   * PROGRESS BAR
   * =========================================================
   */

  function ScoreBar({
    label,
    score,
    icon: Icon,
  }) {

    const status =
      getScoreStatus(score);

    return (
      <div className="space-y-2">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2">

            {Icon && (
              <Icon
                size={17}
                className="text-slate-400"
              />
            )}

            <span className="text-sm text-slate-600">
              {label}
            </span>

          </div>

          <span
            className={`text-sm font-semibold ${status.className}`}
          >
            {score}
          </span>

        </div>

        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">

          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-700"
            style={{
              width: `${score}%`,
            }}
          />

        </div>

      </div>
    );
  }


  /*
   * =========================================================
   * ISSUE CARD
   * =========================================================
   */

  function IssueCard({
    icon: Icon,
    title,
    value,
    description,
    color = "orange",
    onClick,
  }) {

    const colors = {
      red: {
        icon: "bg-red-50 text-red-600",
        number: "text-red-600",
      },

      orange: {
        icon: "bg-orange-50 text-orange-600",
        number: "text-orange-600",
      },

      blue: {
        icon: "bg-blue-50 text-blue-600",
        number: "text-blue-600",
      },

      green: {
        icon: "bg-green-50 text-green-600",
        number: "text-green-600",
      },
    };

    const theme =
      colors[color] || colors.orange;


    return (
      <button
        onClick={onClick}
        className="text-left bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all w-full group"
      >

        <div className="flex items-start justify-between">

          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center ${theme.icon}`}
          >
            <Icon size={21} />
          </div>

          <ChevronRight
            size={19}
            className="text-slate-300 group-hover:text-blue-600 transition"
          />

        </div>


        <p className="text-sm text-slate-500 mt-5">
          {title}
        </p>

        <p
          className={`text-3xl font-bold mt-1 ${theme.number}`}
        >
          {value}
        </p>

        <p className="text-xs text-slate-400 mt-2">
          {description}
        </p>

      </button>
    );
  }


  /*
   * =========================================================
   * OVERVIEW
   * =========================================================
   */

  function Overview() {

    return (
      <div className="space-y-8">


        {/* KPI CARDS */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">


          {/* DEX */}

          <button
            onClick={() =>
              setActiveTab("experience")
            }
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm text-left hover:shadow-md transition group"
          >

            <div className="flex items-center justify-between">

              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">

                <Gauge
                  size={22}
                  className="text-blue-600"
                />

              </div>

              <ChevronRight
                size={19}
                className="text-slate-300 group-hover:text-blue-600"
              />

            </div>

            <p className="text-sm text-slate-500 mt-5">
              Endpoint Experience
            </p>

            <div className="flex items-end gap-2 mt-2">

              <span className="text-4xl font-bold text-slate-900">
                {metrics.dexScore}
              </span>

              <span
                className={`text-sm font-semibold mb-1 ${dexStatus.className}`}
              >
                {dexStatus.label}
              </span>

            </div>

            <p className="text-xs text-slate-400 mt-2">
              Overall digital experience
            </p>

          </button>


          {/* DEVICES */}

          <button
            onClick={() =>
              handleKpiClick("devices")
            }
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm text-left hover:shadow-md transition group"
          >

            <div className="flex items-center justify-between">

              <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center">

                <Laptop
                  size={22}
                  className="text-slate-700"
                />

              </div>

              <ChevronRight
                size={19}
                className="text-slate-300 group-hover:text-blue-600"
              />

            </div>

            <p className="text-sm text-slate-500 mt-5">
              My Devices
            </p>

            <p className="text-4xl font-bold text-slate-900 mt-2">
              {metrics.devices}
            </p>

            <p className="text-xs text-slate-400 mt-2">
              Managed endpoints
            </p>

          </button>


          {/* HEALTHY */}

          <button
            onClick={() =>
              handleKpiClick("healthy")
            }
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm text-left hover:shadow-md transition group"
          >

            <div className="flex items-center justify-between">

              <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">

                <CheckCircle2
                  size={22}
                  className="text-green-600"
                />

              </div>

              <ChevronRight
                size={19}
                className="text-slate-300 group-hover:text-blue-600"
              />

            </div>

            <p className="text-sm text-slate-500 mt-5">
              Healthy Devices
            </p>

            <p className="text-4xl font-bold text-green-600 mt-2">
              {metrics.healthy}
            </p>

            <p className="text-xs text-slate-400 mt-2">
              {Math.round(
                (metrics.healthy /
                  metrics.devices) *
                  100
              )}
              % of devices
            </p>

          </button>


          {/* ATTENTION */}

          <button
            onClick={() =>
              handleKpiClick("attention")
            }
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm text-left hover:shadow-md transition group"
          >

            <div className="flex items-center justify-between">

              <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center">

                <AlertCircle
                  size={22}
                  className="text-orange-600"
                />

              </div>

              <ChevronRight
                size={19}
                className="text-slate-300 group-hover:text-blue-600"
              />

            </div>

            <p className="text-sm text-slate-500 mt-5">
              Attention Required
            </p>

            <p className="text-4xl font-bold text-orange-500 mt-2">
              {metrics.attention}
            </p>

            <p className="text-xs text-slate-400 mt-2">
              Devices need attention
            </p>

          </button>

        </div>


        {/* EXPERIENCE SUMMARY */}

        <section>

          <div className="flex items-center justify-between mb-4">

            <div>

              <h2 className="text-xl font-bold text-slate-900">
                Endpoint Experience
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Understand how your devices are performing.
              </p>

            </div>

            <button
              onClick={() =>
                setActiveTab("experience")
              }
              className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:text-blue-800"
            >
              View details
              <ArrowRight size={16} />
            </button>

          </div>


          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">


            {/* HEALTH SCORE */}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

              <div className="flex items-center justify-between">

                <div>

                  <h3 className="font-semibold text-slate-900">
                    Endpoint Health
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    Overall experience score
                  </p>

                </div>

                <Activity
                  size={22}
                  className="text-blue-600"
                />

              </div>


              <div className="flex items-center justify-center py-10">

                <div className="relative w-40 h-40">

                  <div className="absolute inset-0 rounded-full border-[14px] border-slate-100" />

                  <div
                    className="absolute inset-0 rounded-full border-[14px] border-blue-600"
                    style={{
                      clipPath:
                        "polygon(0 0, 100% 0, 100% 87%, 0 87%)",
                    }}
                  />

                  <div className="absolute inset-0 flex flex-col items-center justify-center">

                    <span className="text-5xl font-bold text-slate-900">
                      {metrics.dexScore}
                    </span>

                    <span className="text-sm text-slate-400">
                      / 100
                    </span>

                  </div>

                </div>

              </div>


              <div className="text-center">

                <span
                  className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${dexStatus.bg} ${dexStatus.className}`}
                >
                  {dexStatus.label}
                </span>

              </div>

            </div>


            {/* HEALTH FACTORS */}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

              <h3 className="font-semibold text-slate-900">
                Health Factors
              </h3>

              <p className="text-sm text-slate-500 mt-1 mb-7">
                Factors contributing to EndpointIQ experience.
              </p>


              <div className="space-y-6">

                <ScoreBar
                  label="Boot Experience"
                  score={metrics.bootScore}
                  icon={Zap}
                />

                <ScoreBar
                  label="Performance"
                  score={metrics.performanceScore}
                  icon={Activity}
                />

                <ScoreBar
                  label="Connectivity"
                  score={metrics.connectivityScore}
                  icon={Wifi}
                />

                <ScoreBar
                  label="Device Health"
                  score={90}
                  icon={ShieldCheck}
                />

              </div>

            </div>

          </div>

        </section>


        {/* TOP ISSUES */}

        <section>

          <div className="flex items-center justify-between mb-4">

            <div>

              <h2 className="text-xl font-bold text-slate-900">
                Attention Required
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Issues currently affecting endpoint experience.
              </p>

            </div>

          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

            <IssueCard
              icon={Activity}
              title="Memory Issues"
              value={metrics.memoryIssues}
              description="Devices with high memory usage"
              color="orange"
              onClick={() =>
                setActiveTab("performance")
              }
            />

            <IssueCard
              icon={RefreshCw}
              title="Not Rebooted"
              value={metrics.notRebooted}
              description="Devices over 7 days"
              color="orange"
              onClick={() =>
                setActiveTab("performance")
              }
            />

            <IssueCard
              icon={AlertCircle}
              title="Slow Logon"
              value={metrics.slowLogon}
              description="Devices above 60 seconds"
              color="red"
              onClick={() =>
                setActiveTab("experience")
              }
            />

            <IssueCard
              icon={Network}
              title="Connectivity"
              value={3}
              description="Devices with network issues"
              color="red"
              onClick={() =>
                setActiveTab("connectivity")
              }
            />

          </div>

        </section>


        {/* AI */}

        <AIInsights
          onNavigate={setActiveTab}
        />

      </div>
    );
  }


  /*
   * =========================================================
   * EXPERIENCE TAB
   * =========================================================
   */

  function Experience() {

    return (
      <div className="space-y-8">

        <PageSectionHeader
          title="Endpoint Experience"
          description="Understand how users experience their managed endpoints."
          icon={Activity}
        />


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          <ScoreCard
            title="Experience Score"
            score={87}
            description="Overall endpoint experience"
          />

          <ScoreCard
            title="Boot Experience"
            score={metrics.bootScore}
            description="Startup and boot performance"
          />

          <ScoreCard
            title="Application Experience"
            score={91}
            description="Application stability"
          />

        </div>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">


          {/* LOGON */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

            <h3 className="font-semibold text-slate-900">
              Logon Experience
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              User sign-in performance across endpoints.
            </p>


            <div className="mt-7 space-y-5">

              <ExperienceBar
                label="Good"
                value="8 devices"
                percentage={67}
                color="bg-green-500"
              />

              <ExperienceBar
                label="Average"
                value="2 devices"
                percentage={17}
                color="bg-yellow-500"
              />

              <ExperienceBar
                label="Frustrating"
                value="2 devices"
                percentage={17}
                color="bg-red-500"
              />

            </div>

          </div>


          {/* BOOT */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

            <h3 className="font-semibold text-slate-900">
              Boot Experience
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Endpoint startup performance.
            </p>


            <div className="mt-7">

              <ScoreBar
                label="Boot Score"
                score={82}
                icon={Zap}
              />

            </div>


            <div className="mt-8 p-4 rounded-xl bg-orange-50 border border-orange-100">

              <div className="flex gap-3">

                <AlertCircle
                  size={20}
                  className="text-orange-600 mt-0.5"
                />

                <div>

                  <p className="font-medium text-orange-800">
                    Slow boot detected
                  </p>

                  <p className="text-sm text-orange-700 mt-1">
                    2 devices have slower-than-expected boot performance.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>


        {/* APPLICATION EXPERIENCE */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

          <div className="flex items-center justify-between">

            <div>

              <h3 className="font-semibold text-slate-900">
                Application Experience
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Applications contributing to endpoint issues.
              </p>

            </div>

            <BarChart3
              size={22}
              className="text-blue-600"
            />

          </div>


          <div className="mt-6 divide-y divide-slate-100">

            <ApplicationRow
              name="Microsoft Teams"
              crashes={3}
              severity="High"
            />

            <ApplicationRow
              name="Outlook"
              crashes={2}
              severity="Medium"
            />

            <ApplicationRow
              name="Microsoft Edge"
              crashes={1}
              severity="Low"
            />

          </div>

        </div>

      </div>
    );
  }


  /*
   * =========================================================
   * PERFORMANCE TAB
   * =========================================================
   */

  function Performance() {

    return (
      <div className="space-y-8">

        <PageSectionHeader
          title="Performance"
          description="Monitor endpoint resource utilization and performance."
          icon={BarChart3}
        />


        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          <ScoreCard
            title="Performance Score"
            score={88}
            description="Overall device performance"
          />

          <MetricCard
            title="Memory Issues"
            value={metrics.memoryIssues}
            description="Devices with high memory usage"
            icon={Activity}
            color="orange"
          />

          <MetricCard
            title="Slow Logon"
            value={metrics.slowLogon}
            description="Devices above 60 seconds"
            icon={Zap}
            color="red"
          />

        </div>


        {/* RESOURCE HEALTH */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

          <h3 className="font-semibold text-slate-900">
            Resource Health
          </h3>

          <p className="text-sm text-slate-500 mt-1">
            Endpoint resource utilization overview.
          </p>


          <div className="mt-8 space-y-7">

            <ResourceBar
              label="CPU"
              value={68}
              status="Normal"
            />

            <ResourceBar
              label="Memory"
              value={74}
              status="Elevated"
            />

            <ResourceBar
              label="Disk"
              value={61}
              status="Normal"
            />

            <ResourceBar
              label="System Responsiveness"
              value={86}
              status="Good"
            />

          </div>

        </div>


        {/* PERFORMANCE ALERTS */}

        <div>

          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Performance Alerts
          </h2>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            <IssueCard
              icon={Activity}
              title="High Memory"
              value={2}
              description="Devices affected"
              color="orange"
            />

            <IssueCard
              icon={Zap}
              title="Slow Logon"
              value={2}
              description="Devices affected"
              color="red"
            />

            <IssueCard
              icon={RefreshCw}
              title="Reboot Required"
              value={3}
              description="Devices over 7 days"
              color="orange"
            />

          </div>

        </div>

      </div>
    );
  }


  /*
   * =========================================================
   * CONNECTIVITY TAB
   * =========================================================
   */

  function Connectivity() {

    return (
      <div className="space-y-8">

        <PageSectionHeader
          title="Connectivity"
          description="Monitor network and wireless endpoint experience."
          icon={Network}
        />


        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          <ScoreCard
            title="Connectivity Score"
            score={metrics.connectivityScore}
            description="Overall network experience"
          />

          <MetricCard
            title="Good Wi-Fi"
            value={metrics.wifiGood}
            description="Devices with good Wi-Fi"
            icon={Wifi}
            color="green"
          />

          <MetricCard
            title="Poor Connectivity"
            value={metrics.wifiPoor}
            description="Devices requiring attention"
            icon={Network}
            color="red"
          />

        </div>


        {/* WIFI */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

            <div className="flex items-center justify-between">

              <div>

                <h3 className="font-semibold text-slate-900">
                  Wi-Fi Experience
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Endpoint wireless experience
                </p>

              </div>

              <Wifi
                size={23}
                className="text-blue-600"
              />

            </div>


            <div className="mt-8">

              <ScoreBar
                label="Good Wi-Fi Experience"
                score={75}
                icon={Wifi}
              />

            </div>


            <div className="grid grid-cols-2 gap-4 mt-8">

              <div className="bg-green-50 rounded-xl p-4">

                <p className="text-sm text-slate-500">
                  Good
                </p>

                <p className="text-2xl font-bold text-green-600 mt-1">
                  9
                </p>

              </div>


              <div className="bg-red-50 rounded-xl p-4">

                <p className="text-sm text-slate-500">
                  Poor
                </p>

                <p className="text-2xl font-bold text-red-600 mt-1">
                  3
                </p>

              </div>

            </div>

          </div>


          {/* CONNECTIVITY ISSUES */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

            <div className="flex items-center justify-between">

              <div>

                <h3 className="font-semibold text-slate-900">
                  Connectivity Issues
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Devices experiencing network problems
                </p>

              </div>

              <AlertCircle
                size={22}
                className="text-orange-500"
              />

            </div>


            <div className="mt-8 space-y-4">

              <ConnectivityIssue
                title="High latency"
                devices="2 devices"
              />

              <ConnectivityIssue
                title="Wi-Fi instability"
                devices="1 device"
              />

              <ConnectivityIssue
                title="Network disconnects"
                devices="1 device"
              />

            </div>

          </div>

        </div>


        {/* NETWORK HEALTH */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

          <h3 className="font-semibold text-slate-900">
            Network Health
          </h3>

          <p className="text-sm text-slate-500 mt-1">
            Key connectivity indicators.
          </p>


          <div className="mt-7 space-y-6">

            <ScoreBar
              label="Internet Connectivity"
              score={95}
              icon={Network}
            />

            <ScoreBar
              label="DNS"
              score={96}
              icon={Activity}
            />

            <ScoreBar
              label="VPN"
              score={91}
              icon={ShieldCheck}
            />

            <ScoreBar
              label="Wi-Fi"
              score={75}
              icon={Wifi}
            />

          </div>

        </div>

      </div>
    );
  }


  /*
   * =========================================================
   * MAIN RENDER
   * =========================================================
   */

  return (

    <div className="min-h-screen bg-slate-100">

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">


        {/* HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">

          <div>

            <button
              onClick={() =>
                navigate("/")
              }
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm mb-4"
            >

              <ArrowLeft size={17} />

              Dashboard

            </button>


            <h1 className="text-3xl font-bold text-slate-900">
              Consumer
            </h1>

            <p className="text-slate-500 mt-1">
              Endpoint experience and device health
            </p>

          </div>


          <div className="flex items-center gap-2 text-sm text-slate-500">

            <RefreshCw size={16} />

            Last updated: Just now

          </div>

        </div>


        {/* TABS */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2 mb-8">

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">

            {tabs.map((tab) => {

              const Icon = tab.icon;

              const active =
                activeTab === tab.id;

              return (

                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(tab.id)
                  }
                  className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >

                  <Icon size={17} />

                  {tab.label}

                </button>

              );

            })}

          </div>

        </div>


        {/* ACTIVE CONTENT */}

        {activeTab === "overview" && (
          <Overview />
        )}

        {activeTab === "experience" && (
          <Experience />
        )}

        {activeTab === "performance" && (
          <Performance />
        )}

        {activeTab === "connectivity" && (
          <Connectivity />
        )}


        {/* FOOTER */}

        <div className="mt-10 pb-6 text-center text-xs text-slate-400">

          EndpointIQ Consumer Experience
          • Endpoint intelligence powered by Intune data

        </div>

      </div>

    </div>

  );
}


/*
 * =========================================================
 * REUSABLE COMPONENTS
 * =========================================================
 */


function PageSectionHeader({
  title,
  description,
  icon: Icon,
}) {

  return (

    <div className="flex items-center gap-4">

      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">

        <Icon
          size={24}
          className="text-blue-600"
        />

      </div>

      <div>

        <h2 className="text-2xl font-bold text-slate-900">
          {title}
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          {description}
        </p>

      </div>

    </div>

  );
}


function ScoreCard({
  title,
  score,
  description,
}) {

  const good =
    score >= 75;

  return (

    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <div className="flex items-end gap-2 mt-3">

        <span className="text-4xl font-bold text-slate-900">
          {score}
        </span>

        <span
          className={`text-sm font-semibold mb-1 ${
            good
              ? "text-green-600"
              : "text-orange-600"
          }`}
        >
          {good
            ? "Good"
            : "Attention"}
        </span>

      </div>

      <p className="text-xs text-slate-400 mt-2">
        {description}
      </p>

    </div>

  );
}


function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  color = "blue",
}) {

  const styles = {

    blue: {
      bg: "bg-blue-50",
      icon: "text-blue-600",
      value: "text-blue-600",
    },

    green: {
      bg: "bg-green-50",
      icon: "text-green-600",
      value: "text-green-600",
    },

    orange: {
      bg: "bg-orange-50",
      icon: "text-orange-600",
      value: "text-orange-600",
    },

    red: {
      bg: "bg-red-50",
      icon: "text-red-600",
      value: "text-red-600",
    },

  };

  const style =
    styles[color] || styles.blue;


  return (

    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

      <div
        className={`w-11 h-11 rounded-xl ${style.bg} flex items-center justify-center`}
      >

        <Icon
          size={21}
          className={style.icon}
        />

      </div>

      <p className="text-sm text-slate-500 mt-5">
        {title}
      </p>

      <p
        className={`text-3xl font-bold mt-1 ${style.value}`}
      >
        {value}
      </p>

      <p className="text-xs text-slate-400 mt-2">
        {description}
      </p>

    </div>

  );
}


function ExperienceBar({
  label,
  value,
  percentage,
  color,
}) {

  return (

    <div>

      <div className="flex justify-between mb-2">

        <span className="text-sm text-slate-600">
          {label}
        </span>

        <span className="text-sm font-semibold text-slate-800">
          {value}
        </span>

      </div>

      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">

        <div
          className={`h-full rounded-full ${color}`}
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

    </div>

  );
}


function ResourceBar({
  label,
  value,
  status,
}) {

  return (

    <div>

      <div className="flex justify-between mb-2">

        <span className="text-sm font-medium text-slate-700">
          {label}
        </span>

        <div className="flex items-center gap-3">

          <span className="text-sm font-semibold">
            {value}%
          </span>

          <span
            className={`text-xs px-2 py-1 rounded-full ${
              value >= 80
                ? "bg-orange-50 text-orange-600"
                : "bg-green-50 text-green-600"
            }`}
          >
            {status}
          </span>

        </div>

      </div>

      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">

        <div
          className={`h-full rounded-full ${
            value >= 80
              ? "bg-orange-500"
              : "bg-blue-600"
          }`}
          style={{
            width: `${value}%`,
          }}
        />

      </div>

    </div>

  );
}


function ApplicationRow({
  name,
  crashes,
  severity,
}) {

  const isHigh =
    severity === "High";

  return (

    <div className="flex items-center justify-between py-4">

      <div className="flex items-center gap-3">

        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">

          <HardDrive
            size={18}
            className="text-slate-500"
          />

        </div>

        <div>

          <p className="font-medium text-slate-800">
            {name}
          </p>

          <p className="text-xs text-slate-400">
            Application stability
          </p>

        </div>

      </div>


      <div className="text-right">

        <p
          className={`font-semibold ${
            isHigh
              ? "text-red-600"
              : "text-orange-600"
          }`}
        >
          {crashes} crashes
        </p>

        <p className="text-xs text-slate-400">
          {severity}
        </p>

      </div>

    </div>

  );
}


function ConnectivityIssue({
  title,
  devices,
}) {

  return (

    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">

      <div className="flex items-center gap-3">

        <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">

          <AlertCircle
            size={18}
            className="text-orange-600"
          />

        </div>

        <span className="font-medium text-slate-700">
          {title}
        </span>

      </div>

      <span className="text-sm font-semibold text-slate-600">
        {devices}
      </span>

    </div>

  );
}


function AIInsights({
  onNavigate,
}) {

  return (

    <section>

      <div className="flex items-center gap-3 mb-4">

        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">

          <Sparkles
            size={21}
            className="text-blue-600"
          />

        </div>

        <div>

          <h2 className="text-xl font-bold text-slate-900">
            EndpointIQ AI Insights
          </h2>

          <p className="text-sm text-slate-500">
            Recommendations based on endpoint experience data.
          </p>

        </div>

      </div>


      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

        <div className="space-y-3">


          <button
            onClick={() =>
              onNavigate("connectivity")
            }
            className="w-full text-left bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl p-4 transition"
          >

            <div className="flex items-center justify-between">

              <div className="flex gap-3">

                <AlertCircle
                  size={20}
                  className="text-red-600 mt-0.5"
                />

                <div>

                  <p className="font-semibold text-red-800">
                    Connectivity issues detected
                  </p>

                  <p className="text-sm text-red-700 mt-1">
                    3 devices are experiencing connectivity problems.
                  </p>

                </div>

              </div>

              <ChevronRight
                size={19}
                className="text-red-400"
              />

            </div>

          </button>


          <button
            onClick={() =>
              onNavigate("performance")
            }
            className="w-full text-left bg-yellow-50 hover:bg-yellow-100 border border-yellow-100 rounded-xl p-4 transition"
          >

            <div className="flex items-center justify-between">

              <div className="flex gap-3">

                <Activity
                  size={20}
                  className="text-yellow-600 mt-0.5"
                />

                <div>

                  <p className="font-semibold text-yellow-800">
                    High memory utilization
                  </p>

                  <p className="text-sm text-yellow-700 mt-1">
                    2 devices have elevated memory usage.
                  </p>

                </div>

              </div>

              <ChevronRight
                size={19}
                className="text-yellow-500"
              />

            </div>

          </button>


          <button
            onClick={() =>
              onNavigate("experience")
            }
            className="w-full text-left bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-xl p-4 transition"
          >

            <div className="flex items-center justify-between">

              <div className="flex gap-3">

                <Zap
                  size={20}
                  className="text-blue-600 mt-0.5"
                />

                <div>

                  <p className="font-semibold text-blue-800">
                    Slow logon performance
                  </p>

                  <p className="text-sm text-blue-700 mt-1">
                    2 devices have logon times above 60 seconds.
                  </p>

                </div>

              </div>

              <ChevronRight
                size={19}
                className="text-blue-500"
              />

            </div>

          </button>

        </div>

      </div>

    </section>

  );
}