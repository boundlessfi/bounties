import {
  UserCompliance,
  KYCTier,
  KYCTierConfig,
  RemainingLimits,
  ComplianceHoldState,
  VerificationStatus,
} from "@/types/compliance";

// Mock Data Store (In-memory for prototype)
const MOCK_COMPLIANCE_DB: Record<string, UserCompliance> = {};

export class ComplianceService {
  // KYC Tier Configuration
  static readonly TIER_CONFIGS: Record<KYCTier, KYCTierConfig> = {
    UNVERIFIED: {
      tier: "UNVERIFIED",
      description: "Basic account access with limited withdrawal capabilities",
      limits: {
        daily: 100,
        weekly: 300,
        monthly: 500,
        perTransaction: 50,
      },
      requirements: [
        "Email verification required",
        "No additional documentation needed",
      ],
      processingTime: "Instant",
    },
    BASIC: {
      tier: "BASIC",
      description: "Standard account with moderate withdrawal limits",
      limits: {
        daily: 1000,
        weekly: 5000,
        monthly: 15000,
        perTransaction: 500,
      },
      requirements: [
        "Email verification",
        "Phone number verification",
        "Basic personal information (name, date of birth)",
      ],
      processingTime: "1-2 business days",
    },
    VERIFIED: {
      tier: "VERIFIED",
      description: "Verified account with higher withdrawal limits",
      limits: {
        daily: 5000,
        weekly: 25000,
        monthly: 75000,
        perTransaction: 2500,
      },
      requirements: [
        "All BASIC requirements",
        "Government-issued ID (passport, driver's license)",
        "Proof of address (utility bill, bank statement)",
      ],
      processingTime: "2-5 business days",
    },
    ENHANCED: {
      tier: "ENHANCED",
      description: "Premium account with maximum withdrawal limits",
      limits: {
        daily: 25000,
        weekly: 100000,
        monthly: 300000,
        perTransaction: 10000,
      },
      requirements: [
        "All VERIFIED requirements",
        "Enhanced identity verification",
        "Video verification call",
        "Source of funds documentation",
      ],
      processingTime: "5-10 business days",
    },
  };

  /**
   * Internal accessor for mutating database records directly
   */
  private static getComplianceRecord(userId: string): UserCompliance {
    if (!MOCK_COMPLIANCE_DB[userId]) {
      MOCK_COMPLIANCE_DB[userId] = this.createDefaultCompliance(userId);
    }
    return MOCK_COMPLIANCE_DB[userId];
  }

  /**
   * Get user's current compliance status (returns a deep clone for callers)
   */
  static async getUserCompliance(userId: string): Promise<UserCompliance> {
    await this.simulateDelay();

    const record = this.getComplianceRecord(userId);

    // Return a deep clone to prevent external mutation of the DB
    return JSON.parse(JSON.stringify(record));
  }

  /**
   * Create default compliance record for new user
   */
  private static createDefaultCompliance(userId: string): UserCompliance {
    const now = new Date().toISOString();
    const tier: KYCTier = "UNVERIFIED";

    return {
      userId,
      currentTier: tier,
      limits: { ...this.TIER_CONFIGS[tier].limits },
      usage: {
        dailyUsed: 0,
        weeklyUsed: 0,
        monthlyUsed: 0,
        lifetimeTotal: 0,
        lastResetDaily: now,
        lastResetWeekly: now,
        lastResetMonthly: now,
      },
      holdState: "NONE",
      verificationStatus: "NOT_STARTED",
      restrictedJurisdiction: false,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Calculate remaining withdrawal amounts with rolling windows
   */
  static async getRemainingLimits(userId: string): Promise<RemainingLimits> {
    // Note: We access the record directly to reset windows
    const compliance = this.getComplianceRecord(userId);

    // Reset usage if windows have passed
    await this.resetExpiredWindows(userId, compliance);

    const { limits, usage } = compliance;

    const dailyRemaining = Math.max(0, limits.daily - usage.dailyUsed);
    const weeklyRemaining = Math.max(0, limits.weekly - usage.weeklyUsed);
    const monthlyRemaining = Math.max(0, limits.monthly - usage.monthlyUsed);

    return {
      daily: dailyRemaining,
      weekly: weeklyRemaining,
      monthly: monthlyRemaining,
      percentUsed: {
        daily:
          limits.daily > 0
            ? Math.min(100, (usage.dailyUsed / limits.daily) * 100)
            : 0,
        weekly:
          limits.weekly > 0
            ? Math.min(100, (usage.weeklyUsed / limits.weekly) * 100)
            : 0,
        monthly:
          limits.monthly > 0
            ? Math.min(100, (usage.monthlyUsed / limits.monthly) * 100)
            : 0,
      },
    };
  }

  /**
   * Reset usage for expired rolling windows
   */
  private static async resetExpiredWindows(
    userId: string,
    compliance: UserCompliance,
  ): Promise<void> {
    const now = new Date();
    const { usage } = compliance;
    let updated = false;

    // Daily reset (24 hours)
    const lastDaily = new Date(usage.lastResetDaily);
    if (now.getTime() - lastDaily.getTime() >= 24 * 60 * 60 * 1000) {
      compliance.usage.dailyUsed = 0;
      compliance.usage.lastResetDaily = now.toISOString();
      updated = true;
    }

    // Weekly reset (7 days)
    const lastWeekly = new Date(usage.lastResetWeekly);
    if (now.getTime() - lastWeekly.getTime() >= 7 * 24 * 60 * 60 * 1000) {
      compliance.usage.weeklyUsed = 0;
      compliance.usage.lastResetWeekly = now.toISOString();
      updated = true;
    }

    // Monthly reset (30 days)
    const lastMonthly = new Date(usage.lastResetMonthly);
    if (now.getTime() - lastMonthly.getTime() >= 30 * 24 * 60 * 60 * 1000) {
      compliance.usage.monthlyUsed = 0;
      compliance.usage.lastResetMonthly = now.toISOString();
      updated = true;
    }

    if (updated) {
      compliance.updatedAt = now.toISOString();
      MOCK_COMPLIANCE_DB[userId] = compliance;
    }
  }

  /**
   * Check if withdrawal would exceed any limits.
   * NOTE: This does not mutate state. Callers must ensure windows are reset if needed.
   */
  static async validateWithdrawalAmount(
    userId: string,
    amount: number,
  ): Promise<{
    valid: boolean;
    exceededLimit?: "daily" | "weekly" | "monthly" | "perTransaction";
  }> {
    const compliance = this.getComplianceRecord(userId);

    // Reset windows before checking limits to ensure data is fresh
    await this.resetExpiredWindows(userId, compliance);

    const { limits, usage } = compliance;

    // Check per-transaction limit
    if (amount > limits.perTransaction) {
      return { valid: false, exceededLimit: "perTransaction" };
    }

    // Check daily limit
    if (usage.dailyUsed + amount > limits.daily) {
      return { valid: false, exceededLimit: "daily" };
    }

    // Check weekly limit
    if (usage.weeklyUsed + amount > limits.weekly) {
      return { valid: false, exceededLimit: "weekly" };
    }

    // Check monthly limit
    if (usage.monthlyUsed + amount > limits.monthly) {
      return { valid: false, exceededLimit: "monthly" };
    }

    return { valid: true };
  }

  /**
   * Track withdrawal usage (call after successful withdrawal)
   */
  static async trackWithdrawal(userId: string, amount: number): Promise<void> {
    const compliance = this.getComplianceRecord(userId);

    compliance.usage.dailyUsed += amount;
    compliance.usage.weeklyUsed += amount;
    compliance.usage.monthlyUsed += amount;
    compliance.usage.lifetimeTotal += amount;
    compliance.updatedAt = new Date().toISOString();

    MOCK_COMPLIANCE_DB[userId] = compliance;
  }

  /**
   * Upgrade user tier after verification approval
   */
  static async upgradeTier(userId: string, newTier: KYCTier): Promise<boolean> {
    const compliance = this.getComplianceRecord(userId);

    const TIER_ORDER: Record<KYCTier, number> = {
      UNVERIFIED: 0,
      BASIC: 1,
      VERIFIED: 2,
      ENHANCED: 3,
    };

    // Prevent downgrades or invalid upgrades
    if (TIER_ORDER[newTier] <= TIER_ORDER[compliance.currentTier]) {
      throw new Error("Cannot downgrade or remain at current tier");
    }

    // Update tier and limits
    compliance.currentTier = newTier;
    compliance.limits = { ...this.TIER_CONFIGS[newTier].limits };
    compliance.verificationStatus = "APPROVED";
    compliance.updatedAt = new Date().toISOString();

    MOCK_COMPLIANCE_DB[userId] = compliance;
    return true;
  }

  /**
   * Set hold state on user account
   */
  static async setHoldState(
    userId: string,
    state: ComplianceHoldState,
    reason?: string,
  ): Promise<void> {
    const compliance = this.getComplianceRecord(userId);

    compliance.holdState = state;
    compliance.holdReason = reason;
    compliance.updatedAt = new Date().toISOString();

    MOCK_COMPLIANCE_DB[userId] = compliance;
  }

  /**
   * Update verification status
   */
  static async updateVerificationStatus(
    userId: string,
    status: VerificationStatus,
  ): Promise<void> {
    const compliance = this.getComplianceRecord(userId);

    compliance.verificationStatus = status;
    compliance.updatedAt = new Date().toISOString();

    MOCK_COMPLIANCE_DB[userId] = compliance;
  }

  /**
   * Mark user as restricted jurisdiction
   */
  static async setJurisdictionRestriction(
    userId: string,
    restricted: boolean,
    jurisdictionCode?: string,
  ): Promise<void> {
    const compliance = this.getComplianceRecord(userId);

    compliance.restrictedJurisdiction = restricted;
    compliance.jurisdictionCode = jurisdictionCode;
    compliance.updatedAt = new Date().toISOString();

    MOCK_COMPLIANCE_DB[userId] = compliance;
  }

  /**
   * Get tier configuration (returns a deep copy)
   */
  static getTierConfig(tier: KYCTier): KYCTierConfig {
    const config = this.TIER_CONFIGS[tier];
    return {
      ...config,
      limits: { ...config.limits },
      requirements: [...config.requirements],
    };
  }

  /**
   * Get all tier configurations (returns deep copies)
   */
  static getAllTierConfigs(): KYCTierConfig[] {
    return (Object.keys(this.TIER_CONFIGS) as KYCTier[]).map((tier) =>
      this.getTierConfig(tier),
    );
  }

  /**
   * Get next tier
   */
  static getNextTier(currentTier: KYCTier): KYCTier | null {
    const tiers: KYCTier[] = ["UNVERIFIED", "BASIC", "VERIFIED", "ENHANCED"];
    const currentIndex = tiers.indexOf(currentTier);

    if (currentIndex === -1 || currentIndex === tiers.length - 1) {
      return null;
    }

    return tiers[currentIndex + 1];
  }

  /**
   * Simulate database delay
   */
  private static async simulateDelay(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  /**
   * Clear all compliance data (for testing)
   */
  static clearAllData(): void {
    Object.keys(MOCK_COMPLIANCE_DB).forEach(
      (key) => delete MOCK_COMPLIANCE_DB[key],
    );
  }
}
