/**
 * Format the currency
 *
 * @param value - The value
 * @param currency - The currency
 * @returns The formatted currency
 */
export const formatCurrency = (value: number, currency: string) => {
  return `${currency} ${value.toFixed(2)}`;
};

/**
 * Format the timestamp
 *
 * @param ts - The timestamp
 * @returns The formatted timestamp
 */
export function formatTimestamp(ts?: {
  _seconds: number;
  _nanoseconds: number;
}) {
  if (!ts) return "-";
  const d = new Date(ts._seconds * 1000);
  return d.toLocaleString();
}

/**
 * Format the address
 *
 * @param address - The address
 * @returns The formatted address
 */
export function formatAddress(address: string) {
  return `${address.slice(0, 10)}...${address.slice(-4)}`;
}

/**
 * Format the role
 *
 * @param role - The role
 * @returns The formatted role
 */
export function formatRole(role: string) {
  return role
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/**
 * Format the text
 *
 * @param text - The text
 * @returns The formatted text
 */
export function formatText(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Format large numbers with suffixes (K, M, B)
 *
 * @param value - The number to format
 * @returns The formatted string
 */
export function formatAmount(value: number): string {
  if (value >= 1000000000) {
    return (value / 1000000000).toString().replace(/\.0$/, "") + "B";
  }
  if (value >= 1000000) {
    return (value / 1000000).toString().replace(/\.0$/, "") + "M";
  }
  if (value >= 1000) {
    return (value / 1000).toString().replace(/\.0$/, "") + "K";
  }
  return value.toString();
}

/**
 * Format percentage values
 *
 * @param value - The value to format (e.g. 0.156)
 * @param decimals - Number of decimal places (default 1)
 * @returns The formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals).replace(/\.0$/, "")}%`;
}

/**
 * Convert bytes to readable format
 *
 * @param bytes - The size in bytes
 * @returns The formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Multiple date format options
 *
 * @param date - The date to format
 * @param format - The format type ('short' | 'long' | 'relative')
 * @returns The formatted date string
 */
export function formatDate(
  date: Date | string | number,
  format: "short" | "long" | "relative" = "short"
): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Invalid Date";

  if (format === "relative") {
    return formatTimeAgo(d);
  }

  if (format === "long") {
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  // short format
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format time duration
 *
 * @param seconds - The duration in seconds
 * @returns The formatted duration string
 */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 || parts.length === 0) parts.push(`${s}s`);

  return parts.join(" ");
}

/**
 * Relative time formatting
 *
 * @param date - The date to format
 * @returns The relative time string
 */
export function formatTimeAgo(date: Date | string | number): string {
  const d = new Date(date);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) {
    return Math.floor(interval) + " years ago";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months ago";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days ago";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours ago";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes ago";
  }
  return Math.floor(seconds) + " seconds ago";
}

/**
 * Convert text to URL-friendly slug
 *
 * @param text - The text to slugify
 * @returns The slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
}

/**
 * Truncate text with ellipsis
 *
 * @param text - The text to truncate
 * @param length - The maximum length
 * @returns The truncated text
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length - 3) + "...";
}
