/**
 * Type definitions for the Logging Middleware.
 *
 * These types enforce compile-time safety so that only valid
 * stack / level / package combinations reach the evaluation server.
 */

/* ------------------------------------------------------------------ */
/*  Stack                                                              */
/* ------------------------------------------------------------------ */
export type Stack = "backend" | "frontend";

/* ------------------------------------------------------------------ */
/*  Severity Levels                                                    */
/* ------------------------------------------------------------------ */
export type Level = "debug" | "info" | "warn" | "error" | "fatal";

/* ------------------------------------------------------------------ */
/*  Package identifiers — scoped by stack                              */
/* ------------------------------------------------------------------ */

/** Packages that may only appear in backend logs */
export type BackendPackage =
  | "cache"
  | "controller"
  | "cron_job"
  | "db"
  | "domain"
  | "handler"
  | "repository"
  | "route"
  | "service";

/** Packages that may only appear in frontend logs */
export type FrontendPackage =
  | "api"
  | "component"
  | "hook"
  | "page"
  | "state"
  | "style";

/** Packages allowed in both backend and frontend logs */
export type SharedPackage = "auth" | "config" | "middleware" | "utils";

/** Union of every valid package name */
export type Package = BackendPackage | FrontendPackage | SharedPackage;

/* ------------------------------------------------------------------ */
/*  API payload / response shapes                                      */
/* ------------------------------------------------------------------ */

/** Body sent to the POST /evaluation-service/logs endpoint */
export interface LogPayload {
  stack: Stack;
  level: Level;
  package: Package;
  message: string;
}

/** Successful response from the log API */
export interface LogResponse {
  logID: string;
  message: string;
}

/** Configuration required to initialise the logger */
export interface LoggerConfig {
  /** Full URL of the log ingestion endpoint */
  apiUrl: string;
  /** Bearer token for authorisation */
  token: string;
}
