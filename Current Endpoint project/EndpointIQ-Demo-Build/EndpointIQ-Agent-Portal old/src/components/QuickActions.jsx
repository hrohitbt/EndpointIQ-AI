import {
  Search,
  Shield,
  Package,
  FileText,
  RefreshCcw,
  Terminal,
  Bot,
  BarChart3,
} from "lucide-react";

const actions = [
  { title: "Search Device", icon: Search },
  { title: "BitLocker", icon: Shield },
  { title: "Applications", icon: Package },
  { title: "Reports", icon: FileText },
  { title: "Sync Device", icon: RefreshCcw },
  { title: "Remote Command", icon: Terminal },
  { title: "Ask AI", icon: Bot },
  { title: "Analytics", icon: BarChart3 },
];

export default function QuickActions() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.title}
              className="border rounded-xl p-5 hover:bg-blue-50 hover:border-blue-500 transition"
            >
              <Icon className="mx-auto mb-3 text-blue-600" size={28} />
              <p className="font-semibold text-center">{action.title}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}