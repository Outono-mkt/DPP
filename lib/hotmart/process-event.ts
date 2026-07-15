import "server-only";

import { processApprovedCustomerAccess } from "@/lib/access/customer-access";
import { generateFirstAccessLink } from "./first-access";
import type { HotmartPurchaseApproved } from "./types";

export type HotmartProcessResult =
  | { ok: true; ignored: true; reason: string }
  | { ok: true; alreadyProcessed: true }
  | { ok: true; createdUser: boolean; firstAccessLinkPrepared: boolean };

export async function processHotmartPurchaseApproved(
  purchase: HotmartPurchaseApproved,
): Promise<HotmartProcessResult> {
  const accessResult = await processApprovedCustomerAccess({
    buyerName: purchase.buyerName,
    email: purchase.normalizedEmail,
    productId: purchase.productId,
    offerCode: purchase.offerCode,
    transactionId: purchase.transactionId,
    purchasedAt: purchase.purchasedAt,
  });

  if (accessResult.status === "already_processed") {
    return { ok: true, alreadyProcessed: true };
  }

  await generateFirstAccessLink(
    purchase.normalizedEmail,
    `${getSiteUrl()}/auth/set-password`,
  );

  return {
    ok: true,
    createdUser: accessResult.createdUser,
    firstAccessLinkPrepared: true,
  };
}

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://dpp-ivory.vercel.app").replace(/\/$/, "");
}
