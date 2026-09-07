import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import axios from "axios";

import Sidebar from "../components/Sidebar";

const API_BASE = "http://127.0.0.1:8000";

export default function Security() {

  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSecurity();
  }, []);

  const loadSecurity = async () => {

    setLoading(true);

    try {

      const response =
        await axios.get(
          `${API_BASE}/devices`
        );

      setDevices(
        response.data?.devices || []
      );

    } catch (error) {

      console.error(
        "Security data error:",
        error
      );

    } finally {

      setLoading(false);

    }
  };


  const compliant =
    devices.filter(
      (device) =>
        (
          device.complianceState || ""
        ).toLowerCase() ===
        "compliant"
    ).length;


  const attention =
    devices.length - compliant;


  const compliancePercentage =
    devices.length > 0
      ? (
          (compliant /
            devices.length) *
          100
        ).toFixed(2)
      : "0.00";


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

            <ShieldCheck size={28} />

          </div>

          <div>

            <h1 className="text-3xl font-bold">
              Security
            </h1>

            <p className="text-slate-500 mt-1">
              Endpoint security and compliance posture
            </p>

          </div>

          <button
            onClick={loadSecurity}
            className="ml-auto p-3 bg-white border rounded-xl hover:bg-slate-50"
          >

            <RefreshCw size={20} />

          </button>

        </div>


        {loading ? (

          <div className="bg-white rounded-2xl p-10 text-center text-slate-500">
            Loading security posture...
          </div>

        ) : (

          <>

            {/* Security KPIs */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">

              <Card
                title="Managed Endpoints"
                value={devices.length}
              />

              <Card
                title="Compliant"
                value={compliant}
              />

              <Card
                title="Requiring Attention"
                value={attention}
              />

            </div>


            {/* Compliance */}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7 mb-6">

              <h2 className="text-xl font-bold mb-4">
                Compliance Posture
              </h2>

              <div className="flex items-center gap-6">

                <div className="text-5xl font-bold text-blue-600">
                  {compliancePercentage}%
                </div>

                <div>

                  <p className="font-semibold">
                    Current compliance
                  </p>

                  <p className="text-sm text-slate-500">
                    {compliant} of{" "}
                    {devices.length} managed
                    devices are compliant.
                  </p>

                </div>

              </div>

            </div>


            {/* Current limitation */}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7">

              <h2 className="text-xl font-bold mb-3">
                EndpointIQ Security Intelligence
              </h2>

              <p className="text-slate-500 leading-7">

                The current backend retrieves
                managed-device compliance
                information from Microsoft
                Graph / Intune.

                <br />
                <br />

                Detailed controls such as
                BitLocker, Microsoft Defender,
                Firewall and Windows Security
                Baseline settings will be
                integrated into this page in
                the next intelligence phase.

              </p>

            </div>

          </>

        )}

      </main>

    </div>

  );
}


function Card({
  title,
  value,
}) {

  return (

    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="text-3xl font-bold mt-2">
        {value}
      </p>

    </div>

  );
}