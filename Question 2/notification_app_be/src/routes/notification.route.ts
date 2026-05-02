import { Router } from "express";
import {
  getAllNotifications,
  getNotificationsByCategory,
  getNotificationsByType,
  postNotifyAll,
  getCacheStatus,
} from "../controllers/notification.controller";

const router = Router();

// Core notification endpoints
router.get("/notifications", getAllNotifications);
router.get("/notifications/category/:category", getNotificationsByCategory);
router.get("/notifications/type/:type", getNotificationsByType);

// Broadcast endpoint — Stage 5
router.post("/notify-all", postNotifyAll);

// Cache monitoring
router.get("/cache-stats", getCacheStatus);

export default router;
