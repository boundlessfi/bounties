import { RestrictedJurisdiction, UserLocation } from "@/types/geography";

const RESTRICTED: RestrictedJurisdiction[] = [
  {
    code: "CU",
    name: "Cuba",
    type: "COUNTRY",
    reason: "OFAC sanctions",
    effectiveDate: "2024-01-01",
  },
  {
    code: "IR",
    name: "Iran",
    type: "COUNTRY",
    reason: "OFAC sanctions",
    effectiveDate: "2024-01-01",
  },
  {
    code: "KP",
    name: "North Korea",
    type: "COUNTRY",
    reason: "OFAC sanctions",
    effectiveDate: "2024-01-01",
  },
  {
    code: "SY",
    name: "Syria",
    type: "COUNTRY",
    reason: "OFAC sanctions",
    effectiveDate: "2024-01-01",
  },
  {
    code: "US-NY",
    name: "New York",
    type: "STATE",
    reason: "BitLicense requirements",
    effectiveDate: "2024-01-01",
  },
];

export class GeoRestrictionService {
  static async checkLocation(
    ip: string,
    override?: Partial<UserLocation>,
  ): Promise<UserLocation> {
    // In production: call ipapi.co, MaxMind, or ip-api.com
    // Example: const response = await fetch(`https://ipapi.co/${ip}/json/`)

    const mockLocation: UserLocation = {
      ip,
      countryCode: override?.countryCode ?? "US",
      countryName: override?.countryName ?? "United States",
      regionCode: override?.regionCode ?? "CA",
      regionName: override?.regionName ?? "California",
      city: override?.city ?? "San Francisco",
      isVPN:
        override?.isVPN !== undefined
          ? override.isVPN
          : await this.detectVPN(ip),
      isProxy:
        override?.isProxy !== undefined
          ? override.isProxy
          : await this.detectProxy(ip),
      isRestricted: false,
    };

    // Check country-level restrictions
    const countryRestriction = RESTRICTED.find(
      (r) => r.code === mockLocation.countryCode && r.type === "COUNTRY",
    );
    if (countryRestriction) {
      mockLocation.isRestricted = true;
      mockLocation.restrictionReason = countryRestriction.reason;
    }

    // Check state-level restrictions (generic support for any country)
    if (mockLocation.regionCode) {
      const reason = this.getRestrictionReason(
        mockLocation.countryCode,
        mockLocation.regionCode,
      );
      if (reason) {
        mockLocation.isRestricted = true;
        mockLocation.restrictionReason = reason;
      }
    }

    return mockLocation;
  }

  static async detectVPN(ip: string): Promise<boolean> {
    /**
     * NOTE: This is a placeholder mock for VPN detection.
     * TODO: Integrate with a real VPN detection service like IPHub, IP2Proxy, or VPNApi.
     */

    // Mock: check against a small list of "VPN-like" public IPs (placeholder logic)
    const vpnIps = ["192.0.2.1", "198.51.100.1"];
    return vpnIps.includes(ip);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async detectProxy(_ip: string): Promise<boolean> {
    // In production: check proxy databases or use APIs
    // For now, use similar logic as VPN detection
    return false;
  }

  static isRestricted(countryCode: string, regionCode?: string): boolean {
    // Check country restriction
    if (
      RESTRICTED.some((r) => r.code === countryCode && r.type === "COUNTRY")
    ) {
      return true;
    }

    // Check state restriction
    if (regionCode) {
      const stateCode = `${countryCode}-${regionCode}`;
      return RESTRICTED.some((r) => r.code === stateCode && r.type === "STATE");
    }

    return false;
  }

  static getRestrictionReason(
    countryCode: string,
    regionCode?: string,
  ): string | null {
    const countryRestriction = RESTRICTED.find(
      (r) => r.code === countryCode && r.type === "COUNTRY",
    );
    if (countryRestriction) {
      return countryRestriction.reason;
    }

    if (regionCode) {
      const stateCode = `${countryCode}-${regionCode}`;
      const stateRestriction = RESTRICTED.find(
        (r) => r.code === stateCode && r.type === "STATE",
      );
      if (stateRestriction) {
        return stateRestriction.reason;
      }
    }

    return null;
  }

  static getRestrictedJurisdictions(): RestrictedJurisdiction[] {
    return [...RESTRICTED];
  }
}
