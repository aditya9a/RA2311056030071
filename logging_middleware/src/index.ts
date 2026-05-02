/**
 * Logging Middleware — public entry point.
 *
 * Usage:
 *   import { initLogger, Log } from "logging-middleware";
 *
 *   initLogger({ apiUrl: "...", token: "..." });
 *   await Log("backend", "info", "service", "Application started");
 */

export { initLogger, Log } from "./logger";

export type {
  Stack,
  Level,
  Package,
  BackendPackage,
  FrontendPackage,
  SharedPackage,
  LogPayload,
  LogResponse,
  LoggerConfig,
} from "./types";

export {
  VALID_STACKS,
  VALID_LEVELS,
  BACKEND_PACKAGES,
  FRONTEND_PACKAGES,
  SHARED_PACKAGES,
  ALL_PACKAGES,
} from "./constants";
