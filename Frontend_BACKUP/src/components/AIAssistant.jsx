import { Bot, Send } from "lucide-react";
import { useState } from "react";

export default function AIAssistant() {
  const [question, setQuestion] = useState("");

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">

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
      </div>

      <div className="bg-slate-50 rounded-xl p-5 mb-6">

        <p>🔴 17 devices are non-compliant.</p>
        <p>🟡 8 devices haven't synced in 7 days.</p>
        <p>🔵 12 HP warranties expire this month.</p>
        <p>🟢 Compliance improved by 2% this week.</p>

      </div>

      <div className="flex gap-3">

        <input
          className="flex-1 border rounded-xl p-3"
          placeholder="Ask EndpointIQ AI..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        <button className="bg-blue-600 text-white rounded-xl px-5">
          <Send size={20} />
        </button>

      </div>

    </div>
  );
}