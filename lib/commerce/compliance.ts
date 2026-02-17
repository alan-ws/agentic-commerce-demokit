import complianceData from "@/config/compliance-rules.json";

interface ComplianceRules {
  ageThresholds: Record<string, number>;
  restrictedMarkets: string[];
  contentSuppressions: Record<string, string[]>;
}

const rules = complianceData as ComplianceRules;

export interface ComplianceInfo {
  market: string;
  ageThreshold: number;
  isRestricted: boolean;
  contentSuppressions: string[];
}

export function getComplianceInfo(market: string): ComplianceInfo {
  return {
    market,
    ageThreshold:
      rules.ageThresholds[market] ?? rules.ageThresholds.default ?? 18,
    isRestricted: rules.restrictedMarkets.includes(market),
    contentSuppressions: rules.contentSuppressions[market] ?? [],
  };
}

export function isMarketRestricted(market: string): boolean {
  return rules.restrictedMarkets.includes(market);
}

export function getAgeThreshold(market: string): number {
  return rules.ageThresholds[market] ?? rules.ageThresholds.default ?? 18;
}

export function verifyAge(
  dateOfBirth: string,
  market: string
): { verified: boolean; requiredAge: number } {
  const requiredAge = getAgeThreshold(market);
  const dob = new Date(dateOfBirth);
  const today = new Date();

  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return { verified: age >= requiredAge, requiredAge };
}
