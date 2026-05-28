"use client";

/**
 * Backward-compatible re-export of the Notification Center.
 * The implementation lives in notification-bell.tsx.
 * This file exists so that existing imports in global-navbar.tsx continue to work.
 */
export { NotificationBell as NotificationCenter } from "./notification-bell";
