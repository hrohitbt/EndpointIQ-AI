import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

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
  {
    name: "Devices",
    icon: Monitor,
    path: "/devices",
  },
  {
    name: "Users",
    icon: Users,
    path: "/users",
  },
  {
    name: "Analytics",
    icon: BarChart3,
    path: "/analytics",
  },
  {
    name: "Security",
    icon: ShieldCheck,
    path: "/security",
  },
  {
    name: "AI Assistant",
    icon: Bot,
    path: "/ai-assistant",
  },
  {
    name: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

export default function Sidebar() {
  const location = useLocation();

  const [dashboardOpen, setDashboardOpen] = useState(
    location.pathname === "/" ||
      location.pathname === "/consumer"
  );

  const mainItemClass = ({ isActive }) =>
    `flex items-center gap-4 w-full rounded-xl px-4 py-3 transition-all ${
      isActive
        ? "bg-blue-600 text-white shadow-md"
        : "text-white hover:bg-slate-800"
    }`;

  const childItemClass = ({ isActive }) =>
    `flex items-center gap-3 w-full rounded-lg px-4 py-2.5 text-sm transition-all ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-slate-300 hover:bg-slate-800 hover:text-white"
    }`;

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col">

      {/* ========================= */}
      {/* LOGO */}
      {/* ========================= */}

      <div className="p-6 border-b border-slate-700">

        <NavLink to="/" className="block">

          <h1 className="text-3xl font-bold">
            EndpointIQ
          </h1>

          <p className="text-sm text-slate-400 mt-1">
            AI Endpoint Intelligence
          </p>

        </NavLink>

      </div>


      {/* ========================= */}
      {/* NAVIGATION */}
      {/* ========================= */}

      <nav className="flex-1 p-4 space-y-2">


        {/* ========================= */}
        {/* DASHBOARD */}
        {/* ========================= */}

        <div>

          <div className="flex items-center gap-2">

            <NavLink
              to="/"
              className={mainItemClass}
              end
            >
              <LayoutDashboard size={20} />

              <span className="flex-1 text-left">
                Dashboard
              </span>
            </NavLink>

            <button
              type="button"
              onClick={() =>
                setDashboardOpen(!dashboardOpen)
              }
              className="p-3 rounded-xl hover:bg-slate-800 transition"
              title="Expand Dashboard"
            >
              <ChevronDown
                size={18}
                className={`transition-transform ${
                  dashboardOpen
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>

          </div>


          {/* ========================= */}
          {/* DASHBOARD CHILDREN */}
          {/* ========================= */}

          {dashboardOpen && (

            <div className="ml-4 pl-4 mt-1 border-l border-slate-700 space-y-1">

              {/* Consumer */}

              <NavLink
                to="/consumer"
                className={childItemClass}
              >
                <User size={17} />

                <span>
                  Consumer
                </span>
              </NavLink>


              {/* Admin */}

              <button
                disabled
                className="flex items-center gap-3 w-full rounded-lg px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
              >
                <Monitor size={17} />

                <span>
                  Admin
                </span>

                <span className="ml-auto text-[10px]">
                  SOON
                </span>
              </button>


              {/* Security */}

              <NavLink
                to="/security"
                className={childItemClass}
              >
                <ShieldCheck size={17} />

                <span>
                  Security
                </span>
              </NavLink>


              {/* Performance */}

              <NavLink
                to="/analytics"
                className={childItemClass}
              >
                <BarChart3 size={17} />

                <span>
                  Performance
                </span>
              </NavLink>

            </div>

          )}

        </div>


        {/* ========================= */}
        {/* MAIN MENU */}
        {/* ========================= */}

        {menus.map((item) => {

          const Icon = item.icon;

          return (

            <NavLink
              key={item.name}
              to={item.path}
              className={mainItemClass}
            >

              <Icon size={20} />

              <span>
                {item.name}
              </span>

            </NavLink>

          );

        })}

      </nav>


      {/* ========================= */}
      {/* FOOTER */}
      {/* ========================= */}

      <div className="p-5 border-t border-slate-700 text-sm text-slate-400">

        <div className="flex items-center justify-between">

          <span>
            EndpointIQ
          </span>

          <span className="text-xs">
            v1.0
          </span>

        </div>

      </div>

    </aside>
  );
}