export function isMembershipEntitled(status: string, currentPeriodEnd: Date | null, now = Date.now()) {
  return (status === "active" || status === "trialing") &&
    currentPeriodEnd !== null &&
    Number.isFinite(currentPeriodEnd.getTime()) &&
    currentPeriodEnd.getTime() > now
}
