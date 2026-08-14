import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/site/EmptyState";
import { OrderSummary } from "@/components/orders/OrderSummary";
import { orderQuery } from "@/lib/queries";
import { formatPKR } from "@/lib/format";

export const Route = createFileRoute("/order-success")({
  validateSearch: (raw: Record<string, unknown>) => ({
    id: typeof raw["id"] === "string" ? raw["id"] : "",
  }),
  head: () => ({
    meta: [
      { title: "Order confirmed — BiteHub" },
      { name: "description", content: "Your BiteHub order has been placed successfully." },
      { property: "og:title", content: "Order confirmed — BiteHub" },
      { property: "og:description", content: "Thanks for ordering with BiteHub." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderSuccessPage,
});

function OrderSuccessPage() {
  const { id } = Route.useSearch();
  const { data: order, isLoading } = useQuery({ ...orderQuery(id), enabled: Boolean(id) });

  if (!id || (!isLoading && !order)) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title="Order not found"
          description="We couldn't find that order. Check your order history instead."
          action={
            <Button asChild>
              <Link to="/orders">My Orders</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (isLoading || !order) {
    return (
      <div className="container-page py-16">
        <div className="mx-auto h-64 max-w-2xl animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  const eta = order.order_type === "pickup" ? "15–20 minutes" : "30–40 minutes";

  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-2xl text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="size-8" />
        </span>
        <h1 className="mt-6 font-display text-3xl font-bold sm:text-4xl">Order Confirmed 🎉</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Thanks {order.customer_name}! Our kitchen has your order and will start cooking shortly.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Order ID</p>
            <p className="font-display text-lg font-bold">{order.code}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Order type</p>
            <p className="font-medium capitalize">{order.order_type}</p>
          </div>
        </div>

        <ul className="mt-4 space-y-3 text-sm">
          {(order.order_items ?? []).map((i) => (
            <li key={i.id} className="flex justify-between gap-3">
              <span>
                {i.quantity}× {i.name}
                {i.selected_options.length > 0 && (
                  <span className="block text-xs text-muted-foreground">
                    {i.selected_options.map((o) => o.label).join(" · ")}
                  </span>
                )}
              </span>
              <span className="font-medium">{formatPKR(Number(i.price) * i.quantity)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 border-t border-border pt-4">
          <OrderSummary
            totals={{
              subtotal: Number(order.subtotal),
              delivery_fee: Number(order.delivery_fee),
              tax: Number(order.tax),
              discount: Number(order.discount),
              total: Number(order.total),
            }}
          />
        </div>

        <p className="mt-6 flex items-center gap-2 rounded-xl bg-secondary p-4 text-sm">
          <Clock className="size-4 text-primary" />
          Estimated {order.order_type === "pickup" ? "pickup" : "delivery"} time: <strong>{eta}</strong>
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/track-order/$id" params={{ id: order.id }}>
              Track Order
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/menu">Order more</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
