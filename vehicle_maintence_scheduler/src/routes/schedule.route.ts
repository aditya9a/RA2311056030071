import { Router } from "express";
import {
  getSchedule,
  getScheduleByDepot,
  getDepots,
  getVehicles,
} from "../controllers/schedule.controller";

const router = Router();

/**
 * Route definitions for the Vehicle Scheduling API.
 *
 *   GET /api/schedule          → Optimal schedule for all depots
 *   GET /api/schedule/:depotId → Optimal schedule for one depot
 *   GET /api/depots            → List all depots (proxied)
 *   GET /api/vehicles          → List all vehicle tasks (proxied)
 */

router.get("/schedule", getSchedule);
router.get("/schedule/:depotId", getScheduleByDepot);
router.get("/depots", getDepots);
router.get("/vehicles", getVehicles);

export default router;
