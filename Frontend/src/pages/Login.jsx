import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] = useState("");

  function handleLogin(e) {
    e.preventDefault();

    setError("");

    if (!username || !password) {
      setError(
        "Please enter your username and password."
      );
      return;
    }

    /*
     * TEMPORARY LOCAL LOGIN
     *
     * This will be replaced by
     * Microsoft Entra ID authentication.
     */

    if (
      username === "admin" &&
      password === "EndpointIQ@123"
    ) {
      localStorage.setItem(
        "endpointiq_authenticated",
        "true"
      );

      localStorage.setItem(
        "endpointiq_user",
        username
      );

      navigate("/");
      return;
    }

    setError(
      "Invalid username or password."
    );
  }


  function handleMicrosoftLogin() {

    /*
     * Microsoft Entra ID / MSAL
     * will be connected here next.
     */

    alert(
      "Microsoft Entra ID login will be connected in the next phase."
    );
  }


  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">

      <div className="w-full max-w-md">

        {/* =====================================
            BRAND
        ====================================== */}

        <div className="text-center mb-8">

          <h1 className="text-4xl font-bold text-slate-900">
            EndpointIQ
          </h1>

          <p className="text-slate-500 mt-2">
            AI Endpoint Intelligence
          </p>

        </div>


        {/* =====================================
            LOGIN CARD
        ====================================== */}

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">

          {/* Header */}

          <div className="text-center mb-8">

            <div className="mx-auto w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">

              <ShieldCheck
                size={30}
                className="text-blue-600"
              />

            </div>

            <h2 className="text-2xl font-bold text-slate-900">
              Sign in
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Sign in to access EndpointIQ
            </p>

          </div>


          {/* Error */}

          {error && (

            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">

              {error}

            </div>

          )}


          {/* Form */}

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            {/* Username */}

            <div>

              <label className="block text-sm font-medium text-slate-700 mb-2">

                Username

              </label>

              <input
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value
                  )
                }
                placeholder="Enter your username"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />

            </div>


            {/* Password */}

            <div>

              <label className="block text-sm font-medium text-slate-700 mb-2">

                Password

              </label>

              <div className="relative">

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  placeholder="Enter your password"
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >

                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}

                </button>

              </div>

            </div>


            {/* Login */}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl py-3 transition"
            >

              Sign In

            </button>

          </form>


          {/* Divider */}

          <div className="flex items-center gap-3 my-6">

            <div className="flex-1 h-px bg-slate-200" />

            <span className="text-xs text-slate-400">
              OR
            </span>

            <div className="flex-1 h-px bg-slate-200" />

          </div>


          {/* Microsoft Login */}

          <button
            onClick={handleMicrosoftLogin}
            className="w-full border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl py-3 transition flex items-center justify-center gap-3"
          >

            <span className="grid grid-cols-2 gap-[2px]">

              <span className="w-2 h-2 bg-red-500" />
              <span className="w-2 h-2 bg-green-500" />
              <span className="w-2 h-2 bg-blue-500" />
              <span className="w-2 h-2 bg-yellow-500" />

            </span>

            Sign in with Microsoft

          </button>


          {/* Demo information */}

          <div className="mt-6 bg-slate-50 rounded-xl p-4">

            <p className="text-xs text-slate-500 text-center">

              Development login:

            </p>

            <p className="text-xs text-slate-700 text-center mt-1">

              admin / EndpointIQ@123

            </p>

          </div>

        </div>


        {/* Footer */}

        <p className="text-center text-xs text-slate-400 mt-6">

          EndpointIQ v1.0

        </p>

      </div>

    </div>
  );
}