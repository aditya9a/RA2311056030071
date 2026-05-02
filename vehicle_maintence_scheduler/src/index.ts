import express from "express";
import { config } from "./config";
import { initLogger, Log } from "logging-middleware";
import scheduleRoutes from "./routes/schedule.route";

/* ================================================================== */
/*  Application Bootstrap                                              */
/* ================================================================== */

const app = express();

// --- Initialise logging middleware (must happen before any Log calls) ---
initLogger({
  apiUrl: config.LOG_API_URL,
  token: config.AUTH_TOKEN,
});

// --- Express middleware ---
app.use(express.json());

// --- Request-level logging middleware ---
app.use(async (req, _res, next) => {
  await Log(
    "backend",
    "debug",
    "middleware",
    `${req.method} ${req.path}`
  );
  next();
});

// --- API routes ---
app.use("/api", scheduleRoutes);

// --- Health check (useful for quick verification) ---
app.get("/health", async (_req, res) => {
  await Log("backend", "debug", "handler", "Health check OK");
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

// --- 404 handler ---
app.use(async (req, res) => {
  await Log("backend", "warn", "handler", `404: ${req.method} ${req.path}`);
  res.status(404).json({ error: `Cannot ${req.method} ${req.url}` });
});

// --- Start the server ---
app.listen(config.PORT, async () => {
  await Log("backend", "info", "config", `Server started on port ${config.PORT}`);
  await Log("backend", "info", "route", "Routes: /api/schedule, /api/depots");
  await Log("backend", "debug", "config", "Server ready to accept requests");
});

export default app;
