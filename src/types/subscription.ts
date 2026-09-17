export type SubscriptionStatus = "trial" | "active" | "expired" | "free";
export type SubscriptionPlan = "none" | "solo" | "family" | "max";

export interface SubscriptionState {
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  trialStartTimestamp: number | null;
  expiryTimestamp: number | null;
  signature: string | null;
}
