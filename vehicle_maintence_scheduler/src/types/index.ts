/**
 * Domain types for the Vehicle Maintenance Scheduler.
 *
 * These mirror the shapes returned by the evaluation-server APIs
 * and define the scheduler's own response structures.


/** A single depot returned by GET /evaluation-service/depots */
export interface Depot {
  ID: number;
  MechanicHours: number;
}

/** Wrapper for the depots API response */
export interface DepotsResponse {
  depots: Depot[];
}

/** A single vehicle maintenance task returned by GET /evaluation-service/vehicles */
export interface Vehicle {
  TaskID: string;
  Duration: number;
  Impact: number;
}

/** Wrapper for the vehicles API response */
export interface VehiclesResponse {
  vehicles: Vehicle[];
}

/*  Scheduler output shapes */

/** The optimal schedule computed for one depot */
export interface DepotSchedule {
  depotId: number;
  availableMechanicHours: number;
  usedMechanicHours: number;
  totalImpact: number;
  tasksSelected: number;
  tasks: Vehicle[];
}

/** Top-level response returned by the scheduling endpoint */
export interface ScheduleResult {
  totalDepots: number;
  totalVehicleTasks: number;
  schedules: DepotSchedule[];
}
