import { Component } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Surfaced in DevTools console instead of silently going blank.
    console.error("EndpointIQ UI crashed:", error, info?.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="grid min-h-screen place-items-center bg-[#f6f8fc] p-6">
          <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-red-600">
              <AlertTriangle size={26} />
            </div>
            <h1 className="mt-4 text-lg font-bold text-slate-900">
              Something in the UI crashed
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {this.state.error?.message || "An unexpected error occurred while rendering this page."}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Full details are in the browser console (F12).
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <RefreshCw size={15} /> Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
