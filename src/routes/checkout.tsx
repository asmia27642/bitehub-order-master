import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Bike, CreditCard, Loader2, LogIn, ShoppingBag, Store, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/site/EmptyState";
import { OrderSummary } from "@/components/orders/OrderSummary";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import { computeTotals, formatPKR, PROMO_CODES, type OrderType } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — BiteHub" },
      { name: "description", content: "Confirm your details and place your BiteHub order." },
      { property: "og:title", content: "Checkout — BiteHub" },
      { property: "og:description", content: "Delivery or pickup, pay your way." },
    ],
  }),
  component: CheckoutPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(80),
  email: z.string().trim().email("Enter a valid email address").max(255),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{10,15}$/, "Enter a valid phone number"),
  address: z.string().trim().max(200),
  city: z.string().trim().max(80),
  notes: z.string().trim().max(300),
});

const PAYMENTS = [
  { id: "cod", label: "Cash on Delivery", icon: Wallet },
  { id: "card", label: "Card Payment", icon: CreditCard },
  { id: "online", label: "Online Payment", icon: ShoppingBag },
] as const;

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [orderType, setOrderType] = useState<OrderType>("delivery");
  const [payment, setPayment] = useState<string>("cod");
  const [promo, setPromo] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; rate: number } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: profile?.name ?? "",
    email: profile?.email ?? user?.email ?? "",
    phone: profile?.phone ?? "",
    address: "",
    city: "",
    notes: "",
  });

  const totals = computeTotals(subtotal, orderType, appliedPromo?.rate ?? 0);
  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  if (items.length === 0) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={<ShoppingBag className="size-6" />}
          title="Nothing to check out yet"
          description="Your cart is empty — pick a few dishes first."
          action={
            <Button asChild size="lg">
              <Link to="/menu">Browse Menu</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={<LogIn className="size-6" />}
          title="Sign in to place your order"
          description="We keep your order history and delivery details in your account."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link to="/login" search={{ redirect: "/checkout" }}>
                  Sign in
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/register">Create account</Link>
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  const applyPromo = () => {
    const code = promo.trim().toUpperCase();
    const rate = PROMO_CODES[code];
    if (!rate) {
      toast.error("That promo code isn't valid.");
      return;
    }
    setAppliedPromo({ code, rate });
    toast.success(`Promo ${code} applied.`);
  };

  const placeOrder = async () => {
    const parsed = schema.safeParse(form);
    const nextErrors: Record<string, string> = {};
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        nextErrors[String(issue.path[0])] = issue.message;
      });
    }
    if (orderType === "delivery") {
      if (form.address.trim().length < 6) nextErrors["address"] = "Enter your delivery address";
      if (form.city.trim().length < 2) nextErrors["city"] = "Enter your city";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setSubmitting(true);
    try {
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          customer_name: form.name.trim(),
          customer_email: form.email.trim(),
          customer_phone: form.phone.trim(),
          order_type: orderType,
          payment_method: payment,
          subtotal: totals.subtotal,
          delivery_fee: totals.delivery_fee,
          tax: totals.tax,
          discount: totals.discount,
          total: totals.total,
          delivery_address: orderType === "delivery" ? form.address.trim() : null,
          city: orderType === "delivery" ? form.city.trim() : null,
          notes: form.notes.trim() || null,
        })
        .select()
        .single();
      if (error) throw error;

      const rows = items.map((i) => ({
          order_id: (order as { id: string }).id,
          menu_item_id: i.itemId,
          name: i.name,
          image: i.image,
          quantity: i.quantity,
          price: i.unitPrice,
          selected_options: i.options,
          notes: i.notes || null,
      }));
      const { error: itemsError } = await supabase.from("order_items").insert(rows as never);
      if (itemsError) throw itemsError;

      clear();
      toast.success("Order placed successfully!");
      void navigate({ to: "/order-success", search: { id: (order as { id: string }).id } });
    } catch (err) {
      console.error(err);
      toast.error("We couldn't place your order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Checkout</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <form
          className="space-y-8"
          onSubmit={(e) => {
            e.preventDefault();
            void placeOrder();
          }}
          noValidate
        >
          <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-semibold">Order type</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(
                [
                  { id: "delivery", label: "Delivery", hint: "Rs. 150 · 30 min", icon: Bike },
                  { id: "pickup", label: "Pickup", hint: "Free · 15 min", icon: Store },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setOrderType(opt.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-4 text-left transition-colors",
                    orderType === opt.id
                      ? "border-primary bg-secondary"
                      : "border-border hover:bg-secondary",
                  )}
                >
                  <opt.icon className="size-5 text-primary" />
                  <span>
                    <span className="block text-sm font-semibold">{opt.label}</span>
                    <span className="block text-xs text-muted-foreground">{opt.hint}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-semibold">Your details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field
                id="name"
                label="Full name"
                value={form.name}
                error={errors["name"]}
                onChange={(v) => set("name", v)}
              />
              <Field
                id="email"
                label="Email"
                type="email"
                value={form.email}
                error={errors["email"]}
                onChange={(v) => set("email", v)}
              />
              <Field
                id="phone"
                label="Phone number"
                value={form.phone}
                error={errors["phone"]}
                onChange={(v) => set("phone", v)}
              />
              {orderType === "delivery" && (
                <Field
                  id="city"
                  label="City"
                  value={form.city}
                  error={errors["city"]}
                  onChange={(v) => set("city", v)}
                />
              )}
              {orderType === "delivery" && (
                <div className="sm:col-span-2">
                  <Field
                    id="address"
                    label="Delivery address"
                    value={form.address}
                    error={errors["address"]}
                    onChange={(v) => set("address", v)}
                  />
                </div>
              )}
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="notes">Additional instructions</Label>
                <Textarea
                  id="notes"
                  maxLength={300}
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Landmark, gate code, allergies…"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-semibold">Payment method</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {PAYMENTS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPayment(p.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-colors",
                    payment === p.id
                      ? "border-primary bg-secondary"
                      : "border-border hover:bg-secondary",
                  )}
                >
                  <p.icon className="size-4 text-primary" /> {p.label}
                </button>
              ))}
            </div>
            {payment !== "cod" && (
              <p className="mt-3 text-xs text-muted-foreground">
                Card and online payments are a demo flow — no real charge is made.
              </p>
            )}
          </section>

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Place Order · {formatPKR(totals.total)}
          </Button>
        </form>

        <aside className="h-fit space-y-6 rounded-2xl border border-border bg-card p-6 shadow-soft lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-semibold">Order summary</h2>
          <ul className="space-y-3 text-sm">
            {items.map((i) => (
              <li key={i.key} className="flex justify-between gap-3">
                <span>
                  <span className="font-medium">
                    {i.quantity}× {i.name}
                  </span>
                  {i.options.length > 0 && (
                    <span className="block text-xs text-muted-foreground">
                      {i.options.map((o) => o.label).join(" · ")}
                    </span>
                  )}
                </span>
                <span className="whitespace-nowrap font-medium">
                  {formatPKR(i.unitPrice * i.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex gap-2">
            <Input
              value={promo}
              onChange={(e) => setPromo(e.target.value)}
              placeholder="Promo code"
              aria-label="Promo code"
            />
            <Button type="button" variant="outline" onClick={applyPromo}>
              Apply
            </Button>
          </div>

          <OrderSummary totals={totals} />
        </aside>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string | undefined;
  type?: string | undefined;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
