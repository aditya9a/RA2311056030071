import axios from "axios";
import { Log } from "logging-middleware";
import { config } from "../config";
import { Depot, DepotsResponse, Vehicle, VehiclesResponse } from "../types";

/* ------------------------------------------------------------------ */
/*  Shared Axios instance for the evaluation server                    */
/* ------------------------------------------------------------------ */

const apiClient = axios.create({
  baseURL: config.API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${config.AUTH_TOKEN}`,
  },
  timeout: 10000,
});

/* ------------------------------------------------------------------ */
/*  Data-fetching functions                                            */
/* ------------------------------------------------------------------ */

/**
 * Fetch all depots from the evaluation server.
 * Each depot has an ID and a MechanicHours budget.
 */
export async function fetchDepots(): Promise<Depot[]> {
  await Log("backend", "info", "service", "Fetching depots from server");

  try {
    const { data } = await apiClient.get<DepotsResponse>(
      "/evaluation-service/depots"
    );

    await Log(
      "backend",
      "info",
      "service",
      `Fetched ${data.depots.length} depots`
    );

    return data.depots;
  } catch (err: unknown) {
    const msg = axios.isAxiosError(err)
      ? `HTTP ${err.response?.status ?? "?"}`
      : "unknown";

    await Log("backend", "error", "service", `Depot fetch failed: ${msg}`);

    throw new Error(`Could not fetch depots: ${msg}`);
  }
}

/**
 * Fetch all vehicle maintenance tasks from the evaluation server.
 * Each task has a TaskID, Duration (hours), and Impact score.
 */
export async function fetchVehicles(): Promise<Vehicle[]> {
  await Log("backend", "info", "service", "Fetching vehicles from server");

  try {
    const { data } = await apiClient.get<VehiclesResponse>(
      "/evaluation-service/vehicles"
    );

    await Log(
      "backend",
      "info",
      "service",
      `Fetched ${data.vehicles.length} vehicle tasks`
    );

    return data.vehicles;
  } catch (err: unknown) {
    const msg = axios.isAxiosError(err)
      ? `HTTP ${err.response?.status ?? "?"}`
      : "unknown";

    await Log("backend", "error", "service", `Vehicle fetch failed: ${msg}`);

    throw new Error(`Could not fetch vehicles: ${msg}`);
  }
}
