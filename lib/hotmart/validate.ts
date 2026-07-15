import "server-only";

import type { HotmartPurchaseApproved, HotmartWebhookPayload } from "./types";

export type HotmartPayloadValidation =
  | { ok: true; event: string; purchase: HotmartPurchaseApproved | null; productId: string | null }
  | { ok: false; status: number; message: string; field: string };

export function validateHottok(request: Request) {
  const expectedHottok = process.env.HOTMART_WEBHOOK_SECRET;
  const receivedHottok = request.headers.get("x-hotmart-hottok");

  if (!expectedHottok) {
    return { ok: false as const, status: 500, message: "Webhook secret is not configured." };
  }

  if (!receivedHottok || receivedHottok !== expectedHottok) {
    return { ok: false as const, status: 401, message: "Unauthorized webhook." };
  }

  return { ok: true as const };
}

export function validateHotmartPayload(payload: unknown): HotmartPayloadValidation {
  if (!isObject(payload)) {
    return invalidPayload("payload");
  }

  const candidate = payload as HotmartWebhookPayload;
  const event = asString(candidate.event);

  if (!event) {
    return invalidPayload("event");
  }

  const productId = asString(candidate.data?.product?.id);

  if (!productId) {
    return invalidPayload("data.product.id");
  }

  if (event !== "PURCHASE_APPROVED") {
    return { ok: true, event, purchase: null, productId };
  }

  const buyerEmail = asString(candidate.data?.buyer?.email);
  const transactionId = asString(candidate.data?.purchase?.transaction);

  if (!buyerEmail) {
    return invalidPayload("data.buyer.email");
  }

  if (!transactionId) {
    return invalidPayload("data.purchase.transaction");
  }

  return {
    ok: true,
    event,
    productId,
    purchase: {
      event: "PURCHASE_APPROVED",
      buyerName: asString(candidate.data?.buyer?.name),
      buyerEmail,
      normalizedEmail: normalizeEmail(buyerEmail),
      productId,
      transactionId,
      offerCode: asString(candidate.data?.purchase?.offer?.code) ?? asString(candidate.data?.offer?.code),
      purchasedAt: normalizeDate(
        candidate.data?.purchase?.approved_date ??
          candidate.data?.purchase?.date_approved ??
          candidate.data?.purchase?.order_date,
      ),
    },
  };
}

export function isAllowedProduct(productId: string | null) {
  const allowedProductId = process.env.HOTMART_PRODUCT_ID ?? "8106727";
  return productId === allowedProductId;
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function invalidPayload(field: string): HotmartPayloadValidation {
  return { ok: false, status: 400, message: "Invalid Hotmart webhook payload.", field };
}

function asString(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeDate(value: unknown) {
  const rawDate = asString(value);

  if (!rawDate) return null;

  const date = new Date(rawDate);

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
