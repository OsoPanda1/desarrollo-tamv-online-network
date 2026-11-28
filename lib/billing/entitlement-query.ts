import { and, eq, gt, inArray, isNotNull } from "drizzle-orm"
import { membershipSubscriptions } from "@/lib/db/schema"

export function membershipEntitlementCondition(userId: string, now = new Date()) {
  return and(
    eq(membershipSubscriptions.userId, userId),
    inArray(membershipSubscriptions.status, ["active", "trialing"]),
    isNotNull(membershipSubscriptions.currentPeriodEnd),
    gt(membershipSubscriptions.currentPeriodEnd, now),
  )
}
