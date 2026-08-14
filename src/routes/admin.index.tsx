import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Banknote, ChefHat, ReceiptText, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { allOrdersQuery, customersQuery, menuItemsQuery } from "@/lib/queries";
import { formatDate, formatPKR, statusLabel } from "@/lib/format";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const { data: orders = [] } = useQuery(allOrdersQuery());
  const { data: customers = [] } = useQuery(customersQuery());
  const { data: items = [] } = useQuery(menuItemsQuery(true));

  const revenue = orders
    .filter((o) => o.order_status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.total), 0);
  const pending = orders.filter((o) =>
    ["pending", "confirmed", "preparing", "ready", "out_for_delivery"].includes(o.order_status),
  ).length;

  const counts = new Map<string, number>();
  orders.forEach((o) =>
    (o.order_items ?? []).forEach((i) => counts.set(i.name, (counts.get(i.name) ?? 0) + i.quantity)),
  );
  const topItems = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  const stats = [
    { label: "Total revenue", value: formatPKR(revenue), icon: Banknote },
    { label: "Total orders", value: String(orders.length), icon: ReceiptText },
    { label: "Active orders", value: String(pending), icon: ChefHat },
    { label: "Customers", value: String(customers.length), icon: Users },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {items.length} menu items live · {orders.length} orders all-time
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
              <s.icon className="size-5" />
            </span>
            <p className="mt-4 font-display text-2xl font-bold">{s.value}</p>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Recent orders</h2>
            <Link to="/admin/orders" className="text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          <ul className="mt-4 space-y-3 text-sm">
            {orders.slice(0, 6).map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3">
                <span>
                  <span className="font-medium">{o.code}</span>
                  <span className="block text-xs text-muted-foreground">
                    {o.customer_name} · {formatDate(o.created_at)}
                  </span>
                </span>
                <span className="flex items-center gap-3">
                  <Badge variant="secondary">{statusLabel(o.order_status, o.order_type)}</Badge>
                  <span className="font-medium">{formatPKR(Number(o.total))}</span>
                </span>
              </li>
            ))}
            {orders.length === 0 && <li className="text-muted-foreground">No orders yet.</li>}
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-display text-lg font-semibold">Top selling items</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {topItems.map(([name, qty]) => (
              <li key={name} className="flex items-center justify-between gap-3">
                <span className="font-medium">{name}</span>
                <span className="text-muted-foreground">{qty} sold</span>
              </li>
            ))}
            {topItems.length === 0 && <li className="text-muted-foreground">No sales yet.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
