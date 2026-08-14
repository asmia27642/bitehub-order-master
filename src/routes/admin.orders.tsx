import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { allOrdersQuery, useUpdateOrderStatus } from "@/lib/queries";
import { ADMIN_STATUSES, formatDate, formatPKR, statusLabel } from "@/lib/format";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

function AdminOrders() {
  const { data: orders = [], isLoading } = useQuery({ ...allOrdersQuery(), refetchInterval: 20000 });
  const update = useUpdateOrderStatus();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = orders.filter((o) => {
    const matchesQuery =
      q.trim() === "" ||
      `${o.code} ${o.customer_name} ${o.customer_email} ${o.customer_phone}`
        .toLowerCase()
        .includes(q.trim().toLowerCase());
    return matchesQuery && (status === "all" || o.order_status === status);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">Update statuses as orders move along.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by code, name, phone…"
          className="max-w-xs"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {ADMIN_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {statusLabel(s, "delivery")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      ) : (
        <ul className="space-y-4">
          {filtered.map((o) => (
            <li key={o.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-display text-lg font-bold">{o.code}</p>
                    <Badge variant="secondary">{o.order_type}</Badge>
                    <Badge variant="outline">{o.payment_method}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDate(o.created_at)}</p>
                  <p className="mt-2 text-sm">
                    {o.customer_name} · {o.customer_phone}
                  </p>
                  {o.delivery_address && (
                    <p className="text-sm text-muted-foreground">
                      {o.delivery_address}, {o.city}
                    </p>
                  )}
                  <p className="mt-2 text-sm text-muted-foreground">
                    {(o.order_items ?? []).map((i) => `${i.quantity}× ${i.name}`).join(", ")}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <p className="font-display text-lg font-bold">{formatPKR(Number(o.total))}</p>
                  <Select
                    value={o.order_status}
                    onValueChange={(next) =>
                      update.mutate(
                        { id: o.id, status: next },
                        {
                          onSuccess: () => toast.success(`${o.code} → ${statusLabel(next, o.order_type)}`),
                          onError: () => toast.error("Couldn't update that order."),
                        },
                      )
                    }
                  >
                    <SelectTrigger className="w-52">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ADMIN_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {statusLabel(s, o.order_type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              No orders match these filters.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
