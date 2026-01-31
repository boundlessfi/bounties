export interface RestrictedJurisdiction {
  code: string; // ISO country code or US state code
  name: string;
  type: 'COUNTRY' | 'STATE';
  reason: string;
  effectiveDate: string;
}

export interface UserLocation {
  ip: string;
  countryCode: string;
  countryName: string;
  regionCode?: string;
  regionName?: string;
  city?: string;
  isVPN: boolean;
  isProxy: boolean;
  isRestricted: boolean;
  restrictionReason?: string;
}
