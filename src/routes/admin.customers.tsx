import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { allOrdersQuery, customersQuery } from "@/lib/queries";
import { formatDate, formatPKR } from "@/lib/format";

export const Route = createFileRoute("/admin/customers")({
  component: AdminCustomers,
});

function AdminCustomers() {
  const { data: customers = [], isLoading } = useQuery(customersQuery());
  const { data: orders = [] } = useQuery(allOrdersQuery());
  const [q, setQ] = useState("");

  const stats = new Map<string, { count: number; spend: number }>();
  orders.forEach((o) => {
    if (!o.user_id || o.order_status === "cancelled") return;
    const prev = stats.get(o.user_id) ?? { count: 0, spend: 0 };
    stats.set(o.user_id, { count: prev.count + 1, spend: prev.spend + Number(o.total) });
  });

  const filtered = customers.filter(
    (c) =>
      q.trim() === "" ||
      `${c.name} ${c.email} ${c.phone ?? ""}`.toLowerCase().includes(q.trim().toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Customers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {customers.length} registered BiteHub customers.
        </p>
      </div>

      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search customers…"
        className="max-w-xs"
      />

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Total spend</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => {
              const s = stats.get(c.id) ?? { count: 0, spend: 0 };
              return (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell>{c.phone ?? "—"}</TableCell>
                  <TableCell>{s.count}</TableCell>
                  <TableCell>{formatPKR(s.spend)}</TableCell>
                  <TableCell>{formatDate(c.created_at)}</TableCell>
                </TableRow>
              );
            })}
            {!isLoading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No customers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
