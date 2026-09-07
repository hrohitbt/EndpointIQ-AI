import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users as UsersIcon,
  Search,
  ArrowLeft,
} from "lucide-react";
import axios from "axios";

import Sidebar from "../components/Sidebar";

const API_BASE = "http://127.0.0.1:8000";

export default function Users() {
  const [devices, setDevices] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/devices`
      );

      setDevices(response.data?.devices || []);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  /*
   * Build user information from Intune devices.
   */
  const users = useMemo(() => {
    const userMap = new Map();

    devices.forEach((device) => {
      const username =
        device.userPrincipalName ||
        device.emailAddress ||
        "Unassigned";

      if (!userMap.has(username)) {
        userMap.set(username, {
          username,
          devices: [],
          compliant: 0,
          attention: 0,
        });
      }

      const user = userMap.get(username);

      user.devices.push(device);

      if (
        (device.complianceState || "").toLowerCase() ===
        "compliant"
      ) {
        user.compliant++;
      } else {
        user.attention++;
      }
    });

    return Array.from(userMap.values())
      .filter((user) =>
        user.username
          .toLowerCase()
          .includes(search.toLowerCase())
      )
      .sort(
        (a, b) =>
          b.devices.length - a.devices.length
      );
  }, [devices, search]);

  return (
    <div className="min-h-screen flex bg-slate-100">

      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <main className="flex-1 min-w-0 p-8">

        {/* Back */}
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
            <UsersIcon size={28} />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Users
            </h1>

            <p className="text-slate-500 mt-1">
              Users and their Intune-managed endpoints
            </p>
          </div>

        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">

          <SummaryCard
            label="Users"
            value={users.length}
          />

          <SummaryCard
            label="Managed Devices"
            value={devices.length}
          />

          <SummaryCard
            label="Devices Requiring Attention"
            value={devices.filter(
              (device) =>
                device.complianceState !==
                "compliant"
            ).length}
          />

        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">

          <div className="relative max-w-xl">

            <Search
              size={20}
              className="absolute left-3 top-3 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search user..."
              className="w-full border border-slate-300 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

        </div>

        {/* Users table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          {loading ? (

            <div className="p-10 text-center text-slate-500">
              Loading users from Intune...
            </div>

          ) : users.length === 0 ? (

            <div className="p-10 text-center text-slate-500">
              No users found.
            </div>

          ) : (

            <table className="min-w-full">

              <thead className="bg-slate-900 text-white">

                <tr>

                  <th className="px-6 py-4 text-left">
                    User
                  </th>

                  <th className="px-6 py-4 text-left">
                    Devices
                  </th>

                  <th className="px-6 py-4 text-left">
                    Compliant
                  </th>

                  <th className="px-6 py-4 text-left">
                    Attention
                  </th>

                </tr>

              </thead>

              <tbody>

                {users.map((user) => (

                  <tr
                    key={user.username}
                    className="border-b hover:bg-slate-50"
                  >

                    <td className="px-6 py-4 font-semibold">
                      {user.username}
                    </td>

                    <td className="px-6 py-4">
                      {user.devices.length}
                    </td>

                    <td className="px-6 py-4 text-green-600 font-semibold">
                      {user.compliant}
                    </td>

                    <td className="px-6 py-4 text-orange-600 font-semibold">
                      {user.attention}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          )}

        </div>

      </main>

    </div>
  );
}


function SummaryCard({ label, value }) {

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">

      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="text-3xl font-bold text-slate-900 mt-2">
        {value}
      </p>

    </div>
  );
}