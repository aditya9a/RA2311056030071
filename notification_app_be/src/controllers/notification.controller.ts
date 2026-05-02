import { Request, Response } from "express";
import { Log } from "logging-middleware";
import {
  getNotifications,
  getByCategory,
  getByType,
  sortNotifications,
  notifyAll,
  getCacheStats,
} from "../services/notification.service";

/* ------------------------------------------------------------------ */
/*  GET /api/notifications                                             */
/*  Fetch all notifications with optional sorting.                     */
/* ------------------------------------------------------------------ */

export async function getAllNotifications(req: Request, res: Response): Promise<void> {
  await Log("backend", "info", "controller", "GET /api/notifications");

  try {
    let notifications = await getNotifications();

    // Optional sorting via query params: ?sortBy=timestamp&order=desc
    const sortBy = req.query.sortBy as string | undefined;
    const order = (req.query.order as "asc" | "desc") || "desc";

    if (sortBy) {
      notifications = sortNotifications(notifications, sortBy, order);
      await Log("backend", "debug", "controller", `Sorted by ${sortBy} ${order}`);
    }

    res.status(200).json({
      count: notifications.length,
      notifications,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    await Log("backend", "error", "controller", `Notif list failed`);
    res.status(500).json({ error: "Internal server error", details: message });
  }
}

/* ------------------------------------------------------------------ */
/*  GET /api/notifications/category/:category                          */
/*  Filter notifications by category.                                  */
/* ------------------------------------------------------------------ */

export async function getNotificationsByCategory(req: Request, res: Response): Promise<void> {
  const { category } = req.params;
  await Log("backend", "info", "controller", `GET by category: ${category}`);

  try {
    let notifications = await getByCategory(category);

    const sortBy = req.query.sortBy as string | undefined;
    const order = (req.query.order as "asc" | "desc") || "desc";
    if (sortBy) {
      notifications = sortNotifications(notifications, sortBy, order);
    }

    res.status(200).json({
      category,
      count: notifications.length,
      notifications,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    await Log("backend", "error", "controller", `Category filter failed`);
    res.status(500).json({ error: "Internal server error", details: message });
  }
}

/* ------------------------------------------------------------------ */
/*  GET /api/notifications/type/:type                                  */
/*  Filter notifications by type.                                      */
/* ------------------------------------------------------------------ */

export async function getNotificationsByType(req: Request, res: Response): Promise<void> {
  const { type } = req.params;
  await Log("backend", "info", "controller", `GET by type: ${type}`);

  try {
    let notifications = await getByType(type);

    const sortBy = req.query.sortBy as string | undefined;
    const order = (req.query.order as "asc" | "desc") || "desc";
    if (sortBy) {
      notifications = sortNotifications(notifications, sortBy, order);
    }

    res.status(200).json({
      type,
      count: notifications.length,
      notifications,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    await Log("backend", "error", "controller", `Type filter failed`);
    res.status(500).json({ error: "Internal server error", details: message });
  }
}

/* ------------------------------------------------------------------ */
/*  POST /api/notify-all — Stage 5                                     */
/*  Broadcast a notification to all students.                          */
/* ------------------------------------------------------------------ */

export async function postNotifyAll(req: Request, res: Response): Promise<void> {
  await Log("backend", "info", "controller", "POST /api/notify-all");

  const { message, category, type } = req.body;

  if (!message || !category || !type) {
    await Log("backend", "warn", "controller", "notify-all: missing fields");
    res.status(400).json({
      error: "message, category, and type are required",
    });
    return;
  }

  try {
    const result = await notifyAll({ message, category, type });
    await Log("backend", "info", "controller", `Notified ${result.notifiedCount} students`);
    res.status(200).json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    await Log("backend", "error", "controller", `notify-all failed`);
    res.status(500).json({ error: "Internal server error", details: message });
  }
}

/* ------------------------------------------------------------------ */
/*  GET /api/cache-stats                                               */
/*  Check current cache status for debugging.                          */
/* ------------------------------------------------------------------ */

export async function getCacheStatus(_req: Request, res: Response): Promise<void> {
  await Log("backend", "debug", "controller", "GET /api/cache-stats");
  res.status(200).json(getCacheStats());
}
