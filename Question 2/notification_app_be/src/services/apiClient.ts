import axios from "axios";
import { Log } from "logging-middleware";
import { config } from "../config";
import { Notification, NotificationsResponse } from "../types";

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
 * Fetch all notifications from the evaluation server.
 */
export async function fetchNotifications(): Promise<Notification[]> {
  await Log("backend", "info", "service", "Fetching notifications from server");

  try {
    const { data } = await apiClient.get<NotificationsResponse>(
      "/evaluation-service/notifications"
    );

    const notifications = data.notifications || [];

    await Log(
      "backend",
      "info",
      "service",
      `Fetched ${notifications.length} notifications`
    );

    return notifications;
  } catch (err: unknown) {
    const msg = axios.isAxiosError(err)
      ? `HTTP ${err.response?.status ?? "?"}`
      : "unknown";

    await Log("backend", "error", "service", `Notif fetch failed: ${msg}`);
    throw new Error(`Could not fetch notifications: ${msg}`);
  }
}
