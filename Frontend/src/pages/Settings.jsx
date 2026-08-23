import { Link } from "react-router-dom";
import {
  Settings as SettingsIcon,
  ArrowLeft,
} from "lucide-react";

import Sidebar from "../components/Sidebar";

export default function Settings() {

  return (

    <div className="min-h-screen flex bg-slate-100">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 min-w-0 p-8">

        {/* Back */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-blue-600 mb-6 hover:text-blue-800"
        >
          <ArrowLeft size={18} />
          Dashboard
        </Link>


        {/* Page Header */}
        <div className="flex items-center gap-4 mb-8">

          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <SettingsIcon size={28} />
          </div>

          <div>

            <h1 className="text-3xl font-bold text-slate-900">
              Settings
            </h1>

            <p className="text-slate-500 mt-1">
              EndpointIQ configuration
            </p>

          </div>

        </div>


        {/* Environment */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7">

          <h2 className="text-xl font-bold text-slate-900 mb-6">
            Current Environment
          </h2>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <InfoCard
              label="Frontend API"
              value="http://127.0.0.1:8000"
            />

            <InfoCard
              label="Data Source"
              value="Microsoft Graph / Intune"
            />

            <InfoCard
              label="Health Engine"
              value="EndpointIQ deterministic rules"
            />

            <InfoCard
              label="AI Status"
              value="Environment summary enabled"
            />

          </div>


          <div className="mt-6 p-4 bg-slate-50 rounded-xl">

            <p className="text-sm text-slate-500 leading-6">

              Production settings such as Managed Identity,
              Azure Key Vault, Microsoft Graph permissions and
              environment-specific configuration will be added
              during the production-hardening phase.

            </p>

          </div>

        </div>

      </main>

    </div>

  );
}


function InfoCard({ label, value }) {

  return (

    <div className="border border-slate-200 rounded-xl p-5">

      <p className="text-sm text-slate-500 mb-2">
        {label}
      </p>

      <p className="font-semibold text-slate-900">
        {value}
      </p>

    </div>

  );

}