import axios from "axios";
import {
  LogPayload,
  LogResponse,
  LoggerConfig,
  Stack,
  Level,
  Package,
} from "./types";
import {
  VALID_STACKS,
  VALID_LEVELS,
  BACKEND_PACKAGES,
  FRONTEND_PACKAGES,
  SHARED_PACKAGES,
} from "./constants";

/* ------------------------------------------------------------------ */
/*  Module-level state                                                 */
/* ------------------------------------------------------------------ */

let loggerConfig: LoggerConfig | null = null;

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Initialise the logger with the evaluation-server URL and a Bearer token.
 * This MUST be called once at application startup before any Log() calls.
 */
export function initLogger(config: LoggerConfig): void {
  loggerConfig = config;
}

/**
 * Send a structured log entry to the evaluation server.
 *
 * @param stack   - "backend" or "frontend"
 * @param level   - Severity: "debug" | "info" | "warn" | "error" | "fatal"
 * @param pkg     - Module/layer the log originates from (validated per stack)
 * @param message - Human-readable description of the event
 * @returns The server response containing a logID, or null on failure
 */
export async function Log(
  stack: Stack,
  level: Level,
  pkg: Package,
  message: string
): Promise<LogResponse | null> {
  // Guard: logger must be initialised first
  if (!loggerConfig) {
    process.stderr.write(
      "[LoggingMiddleware] Logger not initialised — call initLogger() first.\n"
    );
    return null;
  }

  // --- Input validation ---------------------------------------------------

  if (!(VALID_STACKS as readonly string[]).includes(stack)) {
    process.stderr.write(
      `[LoggingMiddleware] Invalid stack "${stack}". Allowed: ${VALID_STACKS.join(", ")}\n`
    );
    return null;
  }

  if (!(VALID_LEVELS as readonly string[]).includes(level)) {
    process.stderr.write(
      `[LoggingMiddleware] Invalid level "${level}". Allowed: ${VALID_LEVELS.join(", ")}\n`
    );
    return null;
  }

  if (!isPackageValidForStack(stack, pkg)) {
    process.stderr.write(
      `[LoggingMiddleware] Package "${pkg}" is not valid for stack "${stack}".\n`
    );
    return null;
  }

  // --- Build & send payload -----------------------------------------------

  const payload: LogPayload = {
    stack,
    level,
    package: pkg,
    message: message.length > 48 ? message.substring(0, 45) + "..." : message,
  };

  try {
    const { data } = await axios.post<LogResponse>(
      loggerConfig.apiUrl,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loggerConfig.token}`,
        },
        timeout: 5000, // 5-second timeout so logs don't block the app
      }
    );
    return data;
  } catch (err: unknown) {
    // Logging failures must never crash the host application
    let errMsg: string;
    if (axios.isAxiosError(err)) {
      const responseData = err.response?.data;
      errMsg = typeof responseData === 'object'
        ? JSON.stringify(responseData)
        : (responseData ?? err.message);
    } else {
      errMsg = String(err);
    }
    process.stderr.write(
      `[LoggingMiddleware] Failed to send log: ${errMsg}\n`
    );
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Internal helpers                                                   */
/* ------------------------------------------------------------------ */

/**
 * Check that `pkg` is allowed for the given `stack`.
 * Shared packages are valid in both stacks.
 */
function isPackageValidForStack(stack: Stack, pkg: Package): boolean {
  const shared: readonly string[] = SHARED_PACKAGES;
  if (shared.includes(pkg)) return true;

  if (stack === "backend") {
    return (BACKEND_PACKAGES as readonly string[]).includes(pkg);
  }

  if (stack === "frontend") {
    return (FRONTEND_PACKAGES as readonly string[]).includes(pkg);
  }

  return false;
}
