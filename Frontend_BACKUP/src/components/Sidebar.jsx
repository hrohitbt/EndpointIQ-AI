import { useState } from "react";
import { Link } from "react-router-dom";

import {
  LayoutDashboard,
  Monitor,
  Users,
  ShieldCheck,
  BarChart3,
  Settings,
  Bot,
  User,
  ChevronDown,
} from "lucide-react";

const menus = [
  { name: "Devices", icon: Monitor },
  { name: "Users", icon: Users },
  { name: "Analytics", icon: BarChart3 },
  { name: "Security", icon: ShieldCheck },
  { name: "AI Assistant", icon: Bot },
  { name: "Settings", icon: Settings },
];

export default function Sidebar() {
  const [dashboardOpen, setDashboardOpen] = useState(true);

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col">

      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-3xl font-bold">
          EndpointIQ
        </h1>

        <p className="text-sm text-slate-400 mt-1">
          AI Endpoint Intelligence
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">

        {/* ========================= */}
        {/* DASHBOARD PARENT */}
        {/* ========================= */}

        <button
          onClick={() => setDashboardOpen(!dashboardOpen)}
          className="flex items-center justify-between w-full rounded-xl px-4 py-3 hover:bg-slate-800 transition-all"
        >
          <div className="flex items-center gap-4">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </div>

          <ChevronDown
            size={18}
            className={`transition-transform ${
              dashboardOpen ? "rotate-180" : ""
            }`}
          />
        </button>


        {/* ========================= */}
        {/* DASHBOARD CHILDREN */}
        {/* ========================= */}

        {dashboardOpen && (
          <div className="ml-4 pl-4 border-l border-slate-700 space-y-1">

            {/* Consumer */}
            <Link
              to="/consumer"
              className="flex items-center gap-3 w-full rounded-lg px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
            >
              <User size={17} />
              <span>Consumer</span>
            </Link>


            {/* Admin - future */}
            <button
              disabled
              className="flex items-center gap-3 w-full rounded-lg px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
            >
              <Monitor size={17} />
              <span>Admin</span>
            </button>


            {/* Security - future */}
            <button
              disabled
              className="flex items-center gap-3 w-full rounded-lg px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
            >
              <ShieldCheck size={17} />
              <span>Security</span>
            </button>


            {/* Performance - future */}
            <button
              disabled
              className="flex items-center gap-3 w-full rounded-lg px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
            >
              <BarChart3 size={17} />
              <span>Performance</span>
            </button>

          </div>
        )}


        {/* ========================= */}
        {/* NORMAL MENU ITEMS */}
        {/* ========================= */}

        {menus.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.name}
              className="flex items-center gap-4 w-full rounded-xl px-4 py-3 hover:bg-slate-800 transition-all"
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </button>
          );
        })}

      </nav>


      {/* Footer */}
      <div className="p-5 border-t border-slate-700 text-sm text-slate-400">
        EndpointIQ v1.0
      </div>

    </aside>
  );
}