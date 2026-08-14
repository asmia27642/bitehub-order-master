export const DELIVERY_FEE = 150;
export const TAX_RATE = 0.05;
export const PROMO_CODES: Record<string, number> = { BITE10: 0.1, WELCOME5: 0.05 };

export function formatPKR(value: number): string {
  return `Rs. ${Math.round(value).toLocaleString("en-PK")}`;
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export type OrderType = "delivery" | "pickup";

export const DELIVERY_STEPS = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
] as const;

export const PICKUP_STEPS = ["pending", "confirmed", "preparing", "ready", "picked_up"] as const;

export const STATUS_LABELS: Record<string, string> = {
  pending: "Order Placed",
  confirmed: "Order Confirmed",
  preparing: "Preparing",
  ready: "Ready",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  picked_up: "Picked Up",
  cancelled: "Cancelled",
};

export const ADMIN_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
  "picked_up",
  "cancelled",
] as const;

export function stepsFor(type: string): readonly string[] {
  return type === "pickup" ? PICKUP_STEPS : DELIVERY_STEPS;
}

export function statusLabel(status: string, type: string): string {
  if (status === "ready" && type === "pickup") return "Ready for Pickup";
  return STATUS_LABELS[status] ?? status;
}

export function computeTotals(subtotal: number, type: OrderType, discountRate = 0) {
  const delivery_fee = type === "delivery" && subtotal > 0 ? DELIVERY_FEE : 0;
  const tax = subtotal * TAX_RATE;
  const discount = subtotal * discountRate;
  const total = Math.max(0, subtotal + delivery_fee + tax - discount);
  return { subtotal, delivery_fee, tax, discount, total };
}
