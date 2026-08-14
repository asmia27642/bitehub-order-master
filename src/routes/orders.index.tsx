import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/site/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { myOrdersQuery } from "@/lib/queries";
import { formatDate, formatPKR, statusLabel } from "@/lib/format";

export const Route = createFileRoute("/orders/")({
  head: () => ({
    meta: [
      { title: "My orders — BiteHub" },
      { name: "description", content: "Review your past BiteHub orders and track live deliveries." },
      { property: "og:title", content: "My orders — BiteHub" },
      { property: "og:description", content: "All your BiteHub orders in one place." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const { user, loading } = useAuth();
  const { data: orders = [], isLoading } = useQuery(myOrdersQuery(user?.id));

  if (!loading && !user) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={<ReceiptText className="size-6" />}
          title="Sign in to see your orders"
          description="Your order history lives in your BiteHub account."
          action={
            <Button asChild>
              <Link to="/login" search={{ redirect: "/orders" }}>
                Sign in
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">My Orders</h1>
      <p className="mt-2 text-sm text-muted-foreground">Track live orders and revisit past meals.</p>

      {isLoading || loading ? (
        <div className="mt-8 space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={<ReceiptText className="size-6" />}
            title="No orders yet"
            description="When you place your first order it will show up here."
            action={
              <Button asChild>
                <Link to="/menu">Start ordering</Link>
              </Button>
            }
          />
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {orders.map((o) => (
            <li
              key={o.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft"
            >
              <div>
                <div className="flex items-center gap-3">
                  <p className="font-display text-lg font-bold">{o.code}</p>
                  <Badge variant="secondary">{statusLabel(o.order_status, o.order_type)}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDate(o.created_at)} · {(o.order_items ?? []).length} item(s) ·{" "}
                  {o.order_type}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {(o.order_items ?? []).map((i) => `${i.quantity}× ${i.name}`).join(", ")}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-display text-lg font-bold">{formatPKR(Number(o.total))}</p>
                <Button asChild variant="outline">
                  <Link to="/track-order/$id" params={{ id: o.id }}>
                    Track
                  </Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
