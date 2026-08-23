import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import ConsumerDashboard from "./pages/ConsumerDashboard";
import DeviceDetails from "./pages/DeviceDetails";
import Devices from "./pages/Devices";
import Users from "./pages/Users";
import Analytics from "./pages/Analytics";
import Security from "./pages/Security";
import AIAssistantPage from "./pages/AIAssistantPage";
import Settings from "./pages/Settings";

import Login from "./pages/Login";


/*
 * ============================================
 * AUTHENTICATION CHECK
 * ============================================
 */

function ProtectedRoute({
  children,
}) {

  const authenticated =
    localStorage.getItem(
      "endpointiq_authenticated"
    ) === "true";

  if (!authenticated) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );

  }

  return children;
}


export default function App() {

  return (

    <BrowserRouter>

      <Routes>


        {/* ==================================
            LOGIN
        =================================== */}

        <Route
          path="/login"
          element={<Login />}
        />


        {/* ==================================
            DASHBOARD
        =================================== */}

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />


        {/* ==================================
            CONSUMER
        =================================== */}

        <Route
          path="/consumer"
          element={
            <ProtectedRoute>
              <ConsumerDashboard />
            </ProtectedRoute>
          }
        />


        {/* ==================================
            DEVICES
        =================================== */}

        <Route
          path="/devices"
          element={
            <ProtectedRoute>
              <Devices />
            </ProtectedRoute>
          }
        />


        {/* ==================================
            DEVICE DETAILS
        =================================== */}

        <Route
          path="/device/:id"
          element={
            <ProtectedRoute>
              <DeviceDetails />
            </ProtectedRoute>
          }
        />


        {/* ==================================
            USERS
        =================================== */}

        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          }
        />


        {/* ==================================
            ANALYTICS
        =================================== */}

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />


        {/* ==================================
            SECURITY
        =================================== */}

        <Route
          path="/security"
          element={
            <ProtectedRoute>
              <Security />
            </ProtectedRoute>
          }
        />


        {/* ==================================
            AI ASSISTANT
        =================================== */}

        <Route
          path="/ai-assistant"
          element={
            <ProtectedRoute>
              <AIAssistantPage />
            </ProtectedRoute>
          }
        />


        {/* ==================================
            SETTINGS
        =================================== */}

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />


        {/* ==================================
            UNKNOWN ROUTE
        =================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>

  );
}