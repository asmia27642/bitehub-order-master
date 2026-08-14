import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/site/EmptyState";
import { OrderTracker } from "@/components/orders/OrderTracker";
import { OrderSummary } from "@/components/orders/OrderSummary";
import { orderQuery } from "@/lib/queries";
import { formatDate, formatPKR, statusLabel } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/track-order/$id")({
  head: () => ({
    meta: [
      { title: "Track your order — BiteHub" },
      { name: "description", content: "Live status of your BiteHub order, updated by our kitchen." },
      { property: "og:title", content: "Track your order — BiteHub" },
      { property: "og:description", content: "Follow your order from kitchen to doorstep." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TrackOrderPage,
});

function TrackOrderPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const { data: order, isLoading } = useQuery({ ...orderQuery(id), refetchInterval: 15000 });

  useEffect(() => {
    const channel = supabase
      .channel(`order-${id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${id}` },
        () => {
          void qc.invalidateQueries({ queryKey: ["order", id] });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [id, qc]);

  if (isLoading) {
    return (
      <div className="container-page py-16">
        <div className="mx-auto h-72 max-w-2xl animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title="Order not found"
          description="This order doesn't exist or belongs to another account."
          action={
            <Button asChild>
              <Link to="/orders">My Orders</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold">Order {order.code}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Placed {formatDate(order.created_at)} · {order.order_type}
            </p>
          </div>
          <Badge className="bg-primary text-primary-foreground">
            {statusLabel(order.order_status, order.order_type)}
          </Badge>
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="mb-6 font-display text-lg font-semibold">Progress</h2>
            <OrderTracker status={order.order_status} type={order.order_type} />
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <h2 className="font-display text-lg font-semibold">Items</h2>
              <ul className="mt-4 space-y-3 text-sm">
                {(order.order_items ?? []).map((i) => (
                  <li key={i.id} className="flex justify-between gap-3">
                    <span>
                      {i.quantity}× {i.name}
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
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 text-sm shadow-soft">
              <h2 className="font-display text-lg font-semibold">
                {order.order_type === "pickup" ? "Pickup" : "Delivery"} details
              </h2>
              <p className="mt-3 text-muted-foreground">{order.customer_name}</p>
              <p className="text-muted-foreground">{order.customer_phone}</p>
              {order.delivery_address && (
                <p className="text-muted-foreground">
                  {order.delivery_address}, {order.city}
                </p>
              )}
              {order.notes && <p className="mt-2 italic text-muted-foreground">“{order.notes}”</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
