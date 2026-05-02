import express from "express";
import cors from "cors";
import { config } from "./config";
import { initLogger, Log } from "logging-middleware";
import notificationRoutes from "./routes/notification.route";

/* ================================================================== */
/*  Application Bootstrap                                              */
/* ================================================================== */

const app = express();

// --- Initialise logging middleware ---
initLogger({
  apiUrl: config.LOG_API_URL,
  token: config.AUTH_TOKEN,
});

// --- Express middleware ---
app.use(cors());
app.use(express.json());

// --- Request-level logging ---
app.use(async (req, _res, next) => {
  await Log("backend", "debug", "middleware", `${req.method} ${req.path}`);
  next();
});

// --- API routes ---
app.use("/api", notificationRoutes);

// --- Health check ---
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
  await Log("backend", "info", "config", `Server on port ${config.PORT}`);
  await Log("backend", "info", "route", "Notification routes ready");
});

export default app;
