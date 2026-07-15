import "server-only";

export type HotmartEvent =
  | "PURCHASE_APPROVED"
  | "PURCHASE_REFUNDED"
  | "PURCHASE_CHARGEBACK"
  | "PURCHASE_CANCELED"
  | string;

export type HotmartWebhookPayload = {
  event?: unknown;
  data?: {
    buyer?: {
      name?: unknown;
      email?: unknown;
    };
    product?: {
      id?: unknown;
      name?: unknown;
    };
    purchase?: {
      transaction?: unknown;
      approved_date?: unknown;
      order_date?: unknown;
      date_approved?: unknown;
      offer?: {
        code?: unknown;
      };
    };
    offer?: {
      code?: unknown;
    };
  };
};

export type HotmartPurchaseApproved = {
  event: "PURCHASE_APPROVED";
  buyerName: string | null;
  buyerEmail: string;
  normalizedEmail: string;
  productId: string;
  transactionId: string;
  offerCode: string | null;
  purchasedAt: string | null;
};
