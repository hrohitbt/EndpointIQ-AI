import { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles } from "lucide-react";
import { agentApi, getAgentApiUrl } from "./agentApi";
import AgentLayout, { EmptyState, PageHeader } from "./AgentLayout";

const SUGGESTIONS = [
  "What needs attention right now?",
  "Any crashes in the last 24 hours?",
  "Is BitLocker on across the fleet?",
  "Which devices are low on disk space?",
];

export default function AgentAI() {
  const [summary, setSummary] = useState([]);
  const [risk, setRisk] = useState([]);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(true);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    Promise.all([
      agentApi.get("/ai-summary"),
      agentApi.get("/ai-risk").catch(() => null),
    ])
      .then(([summaryRes, riskRes]) => {
        setSummary(summaryRes.data?.summary || []);
        setRisk((riskRes?.data?.ranked || []).filter((r) => r.score > 0));
      })
      .catch((err) => setError(err.response?.data?.detail || `Unable to reach ${getAgentApiUrl()}`))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function ask(text) {
    const q = (text ?? question).trim();
    if (!q || asking) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setQuestion("");
    setAsking(true);
    try {
      const res = await agentApi.post("/ai-query", { question: q });
      setMessages((m) => [...m, { role: "assistant", text: res.data?.answer || "No answer returned." }]);
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", text: err.response?.data?.detail || "Couldn't reach the Agent API for that." }]);
    } finally {
      setAsking(false);
    }
  }

  return (
    <AgentLayout title="Fleet Assistant" subtitle="A Claude-powered agent that investigates your fleet's live telemetry.">
      <PageHeader
        eyebrow="EndpointIQ Agent"
        title="Fleet Assistant"
        description="Ask about crashes, security posture, performance, battery, or drivers — the assistant calls the same telemetry tools the rest of the console is built on to ground every answer in real data."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1.3fr]">
        {risk.length > 0 && (
          <section className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm xl:col-span-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-red-800">
              <Bot size={16} /> Needs attention — ranked by real risk signals
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {risk.slice(0, 3).map((r) => (
                <div key={r.device} className="rounded-xl border border-red-200 bg-white p-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">{r.device}</p>
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">{r.score}</span>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {r.reasons.map((reason, i) => (
                      <li key={i} className="text-xs text-slate-500">• {reason}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Sparkles size={16} className="text-blue-600" /> Current fleet summary
          </div>
          {loading ? (
            <p className="mt-4 text-sm text-slate-500">Loading...</p>
          ) : error ? (
            <p className="mt-4 text-sm text-red-600">{error}</p>
          ) : summary.length === 0 ? (
            <div className="mt-4"><EmptyState title="No telemetry yet" message="Once a device reports, a plain-language summary appears here." icon={Bot} /></div>
          ) : (
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              {summary.map((line, i) => (
                <li key={i} className="rounded-xl bg-slate-50 p-3">{line}</li>
              ))}
            </ul>
          )}
        </section>

        <section className="flex h-[560px] flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <p className="text-sm font-semibold">Ask about the fleet</p>
            <p className="text-xs text-slate-500">Try: crashes, BitLocker, disk space, RAM, battery, online devices.</p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => ask(s)}
                    className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-blue-300 hover:text-blue-600"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-6 ${m.role === "user" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-800"}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {asking && <div className="text-xs text-slate-400">Checking telemetry...</div>}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); ask(); }}
            className="flex items-center gap-2 border-t border-slate-100 p-4"
          >
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about the fleet..."
              className="h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />
            <button
              type="submit"
              disabled={asking}
              className="grid h-11 w-11 place-items-center rounded-xl bg-slate-900 text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              <Send size={17} />
            </button>
          </form>
        </section>
      </div>
    </AgentLayout>
  );
}
