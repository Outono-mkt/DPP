import "server-only";

export type HotmartPurchaseStatus = "approved" | "pending" | "canceled" | "refunded";

export type HotmartWebhookPayload = {
  buyerName?: string;
  buyerEmail?: string;
  transaction?: string;
  status?: HotmartPurchaseStatus | string;
};

export function verifyHotmartWebhookSignature() {
  throw new Error("Hotmart webhook verification is not implemented yet.");
}
