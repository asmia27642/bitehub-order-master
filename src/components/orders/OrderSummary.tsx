import { formatPKR } from "@/lib/format";

export interface Totals {
  subtotal: number;
  delivery_fee: number;
  tax: number;
  discount: number;
  total: number;
}

export function OrderSummary({ totals }: { totals: Totals }) {
  const rows = [
    { label: "Subtotal", value: formatPKR(totals.subtotal) },
    { label: "Delivery fee", value: totals.delivery_fee ? formatPKR(totals.delivery_fee) : "Free" },
    { label: "Tax (5%)", value: formatPKR(totals.tax) },
  ];

  return (
    <dl className="space-y-3 text-sm">
      {rows.map((r) => (
        <div key={r.label} className="flex justify-between gap-4">
          <dt className="text-muted-foreground">{r.label}</dt>
          <dd className="font-medium">{r.value}</dd>
        </div>
      ))}
      {totals.discount > 0 && (
        <div className="flex justify-between gap-4 text-success">
          <dt>Discount</dt>
          <dd className="font-medium">− {formatPKR(totals.discount)}</dd>
        </div>
      )}
      <div className="flex justify-between gap-4 border-t border-border pt-3 text-base">
        <dt className="font-semibold">Total</dt>
        <dd className="font-display text-xl font-bold text-primary">{formatPKR(totals.total)}</dd>
      </div>
    </dl>
  );
}
