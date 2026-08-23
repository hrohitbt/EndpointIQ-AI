import { Bot, Send, CircleAlert, CircleCheck, RefreshCw, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

export default function AIAssistant() {
  const navigate = useNavigate();

  const [question, setQuestion] = useState("");
  const [summary, setSummary] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAIData();
  }, []);

  async function loadAIData() {
    try {
      setLoading(true);
      setError("");

      const [summaryResponse, aiResponse] = await Promise.all([
        axios.get(`${API_BASE}/summary`),
        axios.get(`${API_BASE}/ai-summary`),
      ]);

      setSummary(summaryResponse.data);
      setAiSummary(aiResponse.data?.summary || {});
    } catch (err) {
      console.error("Failed to load AI Assistant data:", err);
      setError("Unable to load EndpointIQ insights.");
    } finally {
      setLoading(false);
    }
  }

  function openNonCompliantDevices() {
    navigate("/devices?filter=noncompliant");
  }

  function openDevices() {
    navigate("/devices");
  }

  function handleAsk() {
    const questionText = question.trim();

    if (!questionText) return;

    /*
      We don't have an AI question endpoint in the current backend yet.
      For now, route the most useful device questions to the appropriate
      EndpointIQ views.
    */

    const q = questionText.toLowerCase();

    if (
      q.includes("non-compliant") ||
      q.includes("noncompliant") ||
      q.includes("compliance")
    ) {
      navigate("/devices?filter=noncompliant");
      return;
    }

    if (
      q.includes("device") ||
      q.includes("devices") ||
      q.includes("endpoint")
    ) {
      navigate("/devices");
      return;
    }

    alert(
      "AI query engine is the next EndpointIQ phase. We will connect this box to the AI backend next."
    );
  }

  const nonCompliantCount = summary?.unhealthyDevices ?? 0;
  const totalDevices = summary?.totalDevices ?? 0;
  const compliance = summary?.compliance ?? 0;

  const healthyCount = aiSummary?.healthy ?? 0;
  const warningCount = aiSummary?.warning ?? 0;
  const criticalCount = aiSummary?.critical ?? 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <Bot size={32} className="text-blue-600" />

        <div>
          <h2 className="text-2xl font-bold">
            EndpointIQ AI Assistant
          </h2>

          <p className="text-gray-500">
            AI powered endpoint recommendations
          </p>
        </div>

        <button
          type="button"
          onClick={loadAIData}
          disabled={loading}
          className="ml-auto p-2 rounded-lg hover:bg-slate-100 transition"
          title="Refresh insights"
        >
          <RefreshCw
            size={20}
            className={loading ? "animate-spin text-blue-600" : "text-slate-500"}
          />
        </button>
      </div>

      {/* INSIGHTS */}
      <div className="bg-slate-50 rounded-xl p-5 mb-6">

        {loading ? (
          <div className="text-sm text-slate-500">
            EndpointIQ is analyzing your environment...
          </div>
        ) : error ? (
          <div className="text-sm text-red-600">
            {error}
          </div>
        ) : (
          <div className="space-y-3">

            {/* NON-COMPLIANT */}
            <button
              type="button"
              onClick={openNonCompliantDevices}
              className="w-full flex items-center gap-3 text-left rounded-lg p-2 hover:bg-red-50 transition group"
            >
              <CircleAlert
                size={20}
                className="text-red-500 shrink-0"
              />

              <span className="flex-1">
                <strong>{nonCompliantCount}</strong>{" "}
                devices are non-compliant.
              </span>

              <span className="text-xs text-blue-600 opacity-0 group-hover:opacity-100">
                View →
              </span>
            </button>

            {/* STALE / WARNING */}
            <button
              type="button"
              onClick={openDevices}
              className="w-full flex items-center gap-3 text-left rounded-lg p-2 hover:bg-yellow-50 transition group"
            >
              <CircleAlert
                size={20}
                className="text-yellow-500 shrink-0"
              />

              <span className="flex-1">
                <strong>{warningCount}</strong>{" "}
                devices need attention based on EndpointIQ health scoring.
              </span>

              <span className="text-xs text-blue-600 opacity-0 group-hover:opacity-100">
                View →
              </span>
            </button>

            {/* CRITICAL */}
            <button
              type="button"
              onClick={openDevices}
              className="w-full flex items-center gap-3 text-left rounded-lg p-2 hover:bg-blue-50 transition group"
            >
              <ShieldAlert
                size={20}
                className="text-blue-500 shrink-0"
              />

              <span className="flex-1">
                <strong>{criticalCount}</strong>{" "}
                devices have a critical EndpointIQ health score.
              </span>

              <span className="text-xs text-blue-600 opacity-0 group-hover:opacity-100">
                Investigate →
              </span>
            </button>

            {/* COMPLIANCE */}
            <button
              type="button"
              onClick={openDevices}
              className="w-full flex items-center gap-3 text-left rounded-lg p-2 hover:bg-green-50 transition group"
            >
              <CircleCheck
                size={20}
                className="text-green-500 shrink-0"
              />

              <span className="flex-1">
                Current compliance is{" "}
                <strong>{compliance}%</strong>{" "}
                across {totalDevices} managed devices.
              </span>

              <span className="text-xs text-blue-600 opacity-0 group-hover:opacity-100">
                View →
              </span>
            </button>

          </div>
        )}

      </div>

      {/* ASK ENDPOINTIQ */}
      <div className="flex gap-3">

        <input
          className="flex-1 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ask EndpointIQ AI..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAsk();
            }
          }}
        />

        <button
          type="button"
          onClick={handleAsk}
          className="bg-blue-600 text-white rounded-xl px-5 hover:bg-blue-700 transition"
        >
          <Send size={20} />
        </button>

      </div>

    </div>
  );
}