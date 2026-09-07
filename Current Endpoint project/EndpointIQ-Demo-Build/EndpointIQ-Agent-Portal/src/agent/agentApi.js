
import axios from "axios";

/*
 * EndpointIQ Agent API
 *
 * For local development:
 *   VITE_AGENT_API_URL=http://127.0.0.1:8001/api/agent
 *
 * For Azure/public deployment:
 *   VITE_AGENT_API_URL=https://<your-api-host>/api/agent
 *
 * The UI never hard-codes a device's Wi-Fi/LAN IP.
 */
const AGENT_API_URL =
  import.meta.env.VITE_AGENT_API_URL ||
  "http://127.0.0.1:8001/api/agent";

export const agentApi = axios.create({
  baseURL: AGENT_API_URL,
  timeout: 15000,
});

// Attach the session token (issued by POST /auth/login) to every
// request except the login call itself.
agentApi.interceptors.request.use((config) => {
  if (!config.url?.includes("/auth/login")) {
    const token = localStorage.getItem("endpointiq_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// An expired/invalid session should send the user back to login
// rather than showing a raw 401 in a chart.
agentApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("endpointiq_token");
      localStorage.removeItem("endpointiq_user");
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  }
);

export function getAgentApiUrl() {
  return AGENT_API_URL;
}
