import { Log } from "logging-middleware";
import { Vehicle, Depot, DepotSchedule } from "../types";

/* ================================================================== */
/*  0/1 Knapsack — Dynamic Programming                                */
/*                                                                     */
/*  Maximise total Impact without exceeding the depot's MechanicHours  */
/*  budget. Each vehicle task is either fully included or excluded     */
/*  (no partial servicing).                                            */
/* ================================================================== */

/**
 * Solve the 0/1 knapsack problem for a single depot.
 *
 * @param vehicles - Array of available vehicle tasks
 * @param capacity - The depot's MechanicHours budget
 * @returns Array of selected vehicles that maximise total Impact
 *
 * Time:  O(n × W)  where n = tasks, W = capacity
 * Space: O(n × W)  for the DP table (needed for backtracking)
 */
function knapsack(vehicles: Vehicle[], capacity: number): Vehicle[] {
  const n = vehicles.length;

  // dp[i][w] holds the maximum Impact achievable using items 0..i-1
  // with at most w mechanic-hours of capacity.
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array(capacity + 1).fill(0)
  );

  // --- Fill the DP table ---
  for (let i = 1; i <= n; i++) {
    const task = vehicles[i - 1];
    for (let w = 0; w <= capacity; w++) {
      // Option A: skip this task
      dp[i][w] = dp[i - 1][w];

      // Option B: include this task (if it fits)
      if (task.Duration <= w) {
        const impactIfTaken = dp[i - 1][w - task.Duration] + task.Impact;
        if (impactIfTaken > dp[i][w]) {
          dp[i][w] = impactIfTaken;
        }
      }
    }
  }

  // --- Backtrack to find which tasks were selected ---
  const selected: Vehicle[] = [];
  let remainingCapacity = capacity;

  for (let i = n; i > 0; i--) {
    // If dp[i][w] differs from dp[i-1][w], then item i was included
    if (dp[i][remainingCapacity] !== dp[i - 1][remainingCapacity]) {
      selected.push(vehicles[i - 1]);
      remainingCapacity -= vehicles[i - 1].Duration;
    }
  }

  return selected;
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Compute the optimal maintenance schedule for a single depot.
 */
export async function scheduleForDepot(
  depot: Depot,
  vehicles: Vehicle[]
): Promise<DepotSchedule> {
  await Log(
    "backend",
    "info",
    "service",
    `Knapsack depot ${depot.ID}, cap=${depot.MechanicHours}h`
  );

  const startTime = Date.now();
  const selected = knapsack(vehicles, depot.MechanicHours);
  const elapsed = Date.now() - startTime;

  const totalDuration = selected.reduce((sum, t) => sum + t.Duration, 0);
  const totalImpact = selected.reduce((sum, t) => sum + t.Impact, 0);

  await Log(
    "backend",
    "info",
    "service",
    `Depot ${depot.ID}: ${selected.length}t imp=${totalImpact} ${elapsed}ms`
  );

  return {
    depotId: depot.ID,
    availableMechanicHours: depot.MechanicHours,
    usedMechanicHours: totalDuration,
    totalImpact,
    tasksSelected: selected.length,
    tasks: selected,
  };
}

/**
 * Compute optimal schedules for every depot.
 */
export async function scheduleForAllDepots(
  depots: Depot[],
  vehicles: Vehicle[]
): Promise<DepotSchedule[]> {
  await Log(
    "backend",
    "info",
    "service",
    `Scheduling ${depots.length} depots, ${vehicles.length} tasks`
  );

  const schedules: DepotSchedule[] = [];

  for (const depot of depots) {
    const schedule = await scheduleForDepot(depot, vehicles);
    schedules.push(schedule);
  }

  const grandTotal = schedules.reduce((s, d) => s + d.totalImpact, 0);
  await Log(
    "backend",
    "info",
    "service",
    `All depots done. Total impact: ${grandTotal}`
  );

  return schedules;
}
