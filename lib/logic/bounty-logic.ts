import { parseISO, isValid } from "date-fns";

/**
 * Interface defining the minimal fields required for status logic.
 * Aligned with backend BountyStatus enum values.
 */
export interface StatusAwareBounty {
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export class BountyLogic {
  /**
   * Configuration for inactivity thresholds (in days)
   */
  static readonly INACTIVITY_THRESHOLD_DAYS = 7;

  /**
   * Processes the bounty status based on timestamps.
   * Returns the potentially modified bounty.
   *
   * Note: With the backend-driven status model, most status logic
   * should live on the backend. This method is kept for client-side
   * display purposes only.
   */
  static processBountyStatus<T extends StatusAwareBounty>(bounty: T): T {
    // With backend-driven statuses, we pass through as-is
    return bounty;
  }

  /**
   * Returns metadata about the status suitable for UI display.
   */
  static getClaimStatusDisplay(bounty: StatusAwareBounty) {
    switch (bounty.status) {
      case "OPEN":
        return { label: "Available", color: "green" };
      case "IN_PROGRESS":
        return { label: "In Progress", color: "blue" };
      case "COMPLETED":
        return { label: "Completed", color: "gray" };
      case "CANCELLED":
        return { label: "Cancelled", color: "red" };
      case "DRAFT":
        return { label: "Draft", color: "gray" };
      case "SUBMITTED":
        return { label: "Submitted", color: "yellow" };
      case "UNDER_REVIEW":
        return { label: "Under Review", color: "orange" };
      case "DISPUTED":
        return { label: "Disputed", color: "red" };
      default:
        return { label: bounty.status, color: "gray" };
    }
  }

  private static formatDate(dateStr: string) {
    const date = parseISO(dateStr);
    if (!isValid(date)) return "Invalid Date";
    return date.toLocaleDateString();
  }
}
