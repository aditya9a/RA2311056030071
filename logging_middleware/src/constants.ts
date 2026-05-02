/**
 * Allowed values for each Log() parameter.
 *
 * These arrays are the single source of truth for runtime validation
 * and are also re-exported so consuming applications can reference
 * them if needed (e.g. for building dropdowns or docs).
 */

export const VALID_STACKS = ["backend", "frontend"] as const;

export const VALID_LEVELS = ["debug", "info", "warn", "error", "fatal"] as const;

/** Packages exclusive to backend applications */
export const BACKEND_PACKAGES = [
  "cache",
  "controller",
  "cron_job",
  "db",
  "domain",
  "handler",
  "repository",
  "route",
  "service",
] as const;

/** Packages exclusive to frontend applications */
export const FRONTEND_PACKAGES = [
  "api",
  "component",
  "hook",
  "page",
  "state",
  "style",
] as const;

/** Packages valid in both stacks */
export const SHARED_PACKAGES = [
  "auth",
  "config",
  "middleware",
  "utils",
] as const;

/** Every valid package name regardless of stack */
export const ALL_PACKAGES = [
  ...BACKEND_PACKAGES,
  ...FRONTEND_PACKAGES,
  ...SHARED_PACKAGES,
] as const;
