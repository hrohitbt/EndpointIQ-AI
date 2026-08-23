import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import ConsumerDashboard from "./pages/ConsumerDashboard";
import DeviceDetails from "./pages/DeviceDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Main Dashboard */}
        <Route
          path="/"
          element={<Dashboard />}
        />

        {/* Consumer Dashboard */}
        <Route
          path="/consumer"
          element={<ConsumerDashboard />}
        />

        {/* Device Details */}
        <Route
          path="/device/:id"
          element={<DeviceDetails />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;