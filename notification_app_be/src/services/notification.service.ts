import { Log } from "logging-middleware";
import { LRUCache } from "../cache/lru-cache";
import { Notification, NotifyAllPayload, NotifyAllResult } from "../types";
import { fetchNotifications } from "./apiClient";

/* ------------------------------------------------------------------ */
/*  LRU Cache instance — Stage 4                                       */
/*  Capacity: 100 category-keyed entries, TTL: 60 seconds              */
/* ------------------------------------------------------------------ */

const notificationCache = new LRUCache<Notification[]>(100, 60);
const CACHE_KEY_ALL = "all_notifications";

/* ------------------------------------------------------------------ */
/*  Notification service functions                                     */
/* ------------------------------------------------------------------ */

/**
 * Get all notifications, using LRU cache when available.
 */
export async function getNotifications(): Promise<Notification[]> {
  // Check cache first
  const cached = notificationCache.get(CACHE_KEY_ALL);
  if (cached) {
    await Log("backend", "info", "cache", "Cache HIT: all notifications");
    return cached;
  }

  await Log("backend", "info", "cache", "Cache MISS: fetching from API");

  // Fetch from evaluation server
  const notifications = await fetchNotifications();

  // Store in cache
  notificationCache.put(CACHE_KEY_ALL, notifications);

  // Cache by type (API uses Type as the category field)
  const byType = groupByField(notifications, "Type");
  for (const [type, items] of Object.entries(byType)) {
    notificationCache.put(`category:${type}`, items);
    notificationCache.put(`type:${type}`, items);
  }

  // Also cache by message keywords for flexible lookups
  await Log("backend", "debug", "cache", `Cached ${notifications.length} notifications`);

  return notifications;
}

/**
 * Get notifications filtered by category, using cache.
 */
export async function getByCategory(category: string): Promise<Notification[]> {
  const cacheKey = `category:${category}`;
  const cached = notificationCache.get(cacheKey);

  if (cached) {
    await Log("backend", "info", "cache", `Cache HIT: cat=${category}`);
    return cached;
  }

  await Log("backend", "info", "cache", `Cache MISS: cat=${category}`);

  // Fetch all and filter — API uses Type as category
  const all = await getNotifications();
  const filtered = all.filter(
    (n) => (n.Category || n.Type || "").toLowerCase() === category.toLowerCase()
  );

  notificationCache.put(cacheKey, filtered);
  return filtered;
}

/**
 * Get notifications filtered by type, using cache.
 */
export async function getByType(type: string): Promise<Notification[]> {
  const cacheKey = `type:${type}`;
  const cached = notificationCache.get(cacheKey);

  if (cached) {
    await Log("backend", "info", "cache", `Cache HIT: type=${type}`);
    return cached;
  }

  await Log("backend", "info", "cache", `Cache MISS: type=${type}`);

  const all = await getNotifications();
  const filtered = all.filter(
    (n) => (n.Type || "").toLowerCase() === type.toLowerCase()
  );

  notificationCache.put(cacheKey, filtered);
  return filtered;
}

/**
 * Sort notifications by a given field.
 */
export function sortNotifications(
  notifications: Notification[],
  sortBy: string,
  order: "asc" | "desc" = "desc"
): Notification[] {
  const sorted = [...notifications];

  sorted.sort((a, b) => {
    let valA: string | boolean;
    let valB: string | boolean;

    switch (sortBy) {
      case "timestamp":
        valA = a.Timestamp;
        valB = b.Timestamp;
        break;
      case "type":
        valA = a.Type;
        valB = b.Type;
        break;
      case "category":
        valA = a.Category || a.Type;
        valB = b.Category || b.Type;
        break;
      default:
        valA = a.Timestamp;
        valB = b.Timestamp;
    }

    if (valA < valB) return order === "asc" ? -1 : 1;
    if (valA > valB) return order === "asc" ? 1 : -1;
    return 0;
  });

  return sorted;
}

/**
 * Simulate broadcasting a notification to all students — Stage 5.
 * In a real system this would push to a message queue or email service.
 */
export async function notifyAll(payload: NotifyAllPayload): Promise<NotifyAllResult> {
  const studentCount = 20000;

  await Log(
    "backend",
    "info",
    "service",
    `notify_all: ${payload.category}`
  );

  // Invalidate cache since new notifications exist
  notificationCache.clear();
  await Log("backend", "info", "cache", "Cache cleared after notify_all");

  return {
    success: true,
    message: `Notification sent to ${studentCount} students`,
    notifiedCount: studentCount,
  };
}

/**
 * Get cache statistics for monitoring.
 */
export function getCacheStats() {
  return {
    size: notificationCache.size,
    capacity: 100,
  };
}

/* ------------------------------------------------------------------ */
/*  Helper                                                             */
/* ------------------------------------------------------------------ */

function groupByField(
  notifications: Notification[],
  field: keyof Notification
): Record<string, Notification[]> {
  const groups: Record<string, Notification[]> = {};

  for (const n of notifications) {
    const key = String(n[field] || "unknown");
    if (key === "undefined" || key === "unknown") continue;
    if (!groups[key]) groups[key] = [];
    groups[key].push(n);
  }

  return groups;
}
