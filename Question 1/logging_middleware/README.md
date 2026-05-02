# Logging Middleware

Reusable logging package that sends structured logs to the evaluation server.

## Usage

```typescript
import { initLogger, Log } from "logging-middleware";

initLogger({ apiUrl: "...", token: "..." });
await Log("backend", "info", "service", "Server started");
```

Messages are auto-truncated to 48 chars. Stack, level, and package values are validated before sending.
