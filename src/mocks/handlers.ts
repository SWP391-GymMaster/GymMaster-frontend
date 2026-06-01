import type { RequestHandler } from "msw"

import { authHandlers } from "@/mocks/handlers/auth.handlers"
import { billingHandlers } from "@/mocks/handlers/billing.handlers"
import { checkinHandlers } from "@/mocks/handlers/checkin.handlers"
import { dashboardAuditHandlers } from "@/mocks/handlers/dashboard-audit.handlers"
import { memberHandlers } from "@/mocks/handlers/member.handlers"
import { nutritionHandlers } from "@/mocks/handlers/nutrition.handlers"
import { progressHandlers } from "@/mocks/handlers/progress.handlers"
import { trainingHandlers } from "@/mocks/handlers/training.handlers"
import { member360Handlers } from "@/mocks/handlers/member-360.handlers"

export const handlers: RequestHandler[] = [
  ...authHandlers,
  ...memberHandlers,
  ...billingHandlers,
  ...checkinHandlers,
  ...trainingHandlers,
  ...member360Handlers,
  ...progressHandlers,
  ...nutritionHandlers,
  ...dashboardAuditHandlers,
]
