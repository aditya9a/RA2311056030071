import { Request, Response } from "express";
import { Log } from "logging-middleware";
import { fetchDepots, fetchVehicles } from "../services/apiClient";
import {
  scheduleForAllDepots,
  scheduleForDepot,
} from "../services/scheduler.service";
import { ScheduleResult } from "../types";

/* ------------------------------------------------------------------ */
/*  GET /api/schedule                                                  */
/*  Compute optimal maintenance schedules for ALL depots.              */
/* ------------------------------------------------------------------ */

export async function getSchedule(_req: Request, res: Response): Promise<void> {
  await Log("backend", "info", "controller", "GET /api/schedule requested");

  try {
    // Fetch live data from the evaluation server
    const [depots, vehicles] = await Promise.all([
      fetchDepots(),
      fetchVehicles(),
    ]);

    await Log(
      "backend",
      "debug",
      "controller",
      `${depots.length} depots, ${vehicles.length} tasks`
    );

    // Solve the knapsack for every depot
    const schedules = await scheduleForAllDepots(depots, vehicles);

    const result: ScheduleResult = {
      totalDepots: depots.length,
      totalVehicleTasks: vehicles.length,
      schedules,
    };

    await Log("backend", "info", "controller", "Schedules computed OK");

    res.status(200).json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    await Log("backend", "error", "controller", `Schedule failed: ${message}`);
    res.status(500).json({ error: "Internal server error", details: message });
  }
}

/* ------------------------------------------------------------------ */
/*  GET /api/schedule/:depotId                                         */
/*  Compute optimal schedule for a SINGLE depot.                       */
/* ------------------------------------------------------------------ */

export async function getScheduleByDepot(
  req: Request,
  res: Response
): Promise<void> {
  const depotId = parseInt(req.params.depotId, 10);

  if (isNaN(depotId)) {
    await Log("backend", "warn", "controller", `Bad depot ID: ${req.params.depotId}`);
    res.status(400).json({ error: "depotId must be an integer" });
    return;
  }

  await Log("backend", "info", "controller", `Schedule for depot ${depotId}`);

  try {
    const [depots, vehicles] = await Promise.all([
      fetchDepots(),
      fetchVehicles(),
    ]);

    const depot = depots.find((d) => d.ID === depotId);
    if (!depot) {
      await Log("backend", "warn", "controller", `Depot ${depotId} not found`);
      res.status(404).json({ error: `Depot ${depotId} not found` });
      return;
    }

    const schedule = await scheduleForDepot(depot, vehicles);

    await Log(
      "backend",
      "info",
      "controller",
      `Depot ${depotId} impact=${schedule.totalImpact}`
    );

    res.status(200).json(schedule);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    await Log("backend", "error", "controller", `Depot ${depotId} failed`);
    res.status(500).json({ error: "Internal server error", details: message });
  }
}

/* ------------------------------------------------------------------ */
/*  GET /api/depots                                                    */
/*  Proxy: list available depots from the evaluation server.           */
/* ------------------------------------------------------------------ */

export async function getDepots(_req: Request, res: Response): Promise<void> {
  await Log("backend", "info", "controller", "GET /api/depots requested");

  try {
    const depots = await fetchDepots();
    res.status(200).json({ depots });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    await Log("backend", "error", "controller", `Depots failed: ${message}`);
    res.status(500).json({ error: "Internal server error", details: message });
  }
}

/* ------------------------------------------------------------------ */
/*  GET /api/vehicles                                                  */
/*  Proxy: list available vehicle tasks from the evaluation server.    */
/* ------------------------------------------------------------------ */

export async function getVehicles(
  _req: Request,
  res: Response
): Promise<void> {
  await Log("backend", "info", "controller", "GET /api/vehicles requested");

  try {
    const vehicles = await fetchVehicles();
    res.status(200).json({ vehicles });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    await Log("backend", "error", "controller", `Vehicles failed: ${message}`);
    res.status(500).json({ error: "Internal server error", details: message });
  }
}
