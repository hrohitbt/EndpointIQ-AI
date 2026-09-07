# EndpointIQ Agent UI v2

This update is isolated to the Agent experience.

## What changed

- `/devices` is now a dedicated Agent Console with:
  - Overview
  - Devices
  - Applications
  - Services
  - Security
  - Reports
- `/device/:id` uses the Agent API instead of the old port 8000 API.
- The original `/` dashboard and its charts were not changed.
- The UI does not invent security/compliance values when the Agent has not reported them.
- API URL is configurable with `VITE_AGENT_API_URL`.

## Local test

Create `.env.local`:

```text
VITE_AGENT_API_URL=http://127.0.0.1:8001/api/agent
```

For Azure:

```text
VITE_AGENT_API_URL=https://YOUR-PUBLIC-AGENT-API/api/agent
```

Important: if the browser is running on a UK device, `127.0.0.1` means the UK device itself. It must point to your public Azure API hostname.
