import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Bot,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import AIAssistant from "../components/AIAssistant";

export default function AIAssistantPage() {

  return (

    <div className="min-h-screen flex bg-slate-100">

      <Sidebar />

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

            <Bot size={28} />

          </div>

          <div>

            <h1 className="text-3xl font-bold">
              AI Assistant
            </h1>

            <p className="text-slate-500 mt-1">
              EndpointIQ environment intelligence and investigation
            </p>

          </div>

        </div>


        {/* Existing AI component */}

        <AIAssistant />

      </main>

    </div>

  );
}