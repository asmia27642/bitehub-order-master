import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/site/EmptyState";
import { OrderSummary } from "@/components/orders/OrderSummary";
import { useCart } from "@/hooks/useCart";
import { computeTotals, formatPKR } from "@/lib/format";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your cart — BiteHub" },
      { name: "description", content: "Review your BiteHub order before checkout." },
      { property: "og:title", content: "Your cart — BiteHub" },
      { property: "og:description", content: "Review and adjust your BiteHub order." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, subtotal, setQuantity, remove, clear } = useCart();
  const totals = computeTotals(subtotal, "delivery");

  if (items.length === 0) {
    return (
      <div className="container-page py-16">
        <h1 className="mb-8 font-display text-3xl font-bold">Your cart</h1>
        <EmptyState
          icon={<ShoppingBag className="size-6" />}
          title="Your cart is empty"
          description="Add a few dishes from the menu and they'll show up here."
          action={
            <Button asChild size="lg">
              <Link to="/menu">Browse Menu</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold">Your cart</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            clear();
            toast.success("Cart cleared.");
          }}
        >
          Clear cart
        </Button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <ul className="space-y-4">
          {items.map((item) => (
            <li
              key={item.key}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft sm:flex-row"
            >
              <img
                src={item.image ?? "/images/hero.jpg"}
                alt={item.name}
                loading="lazy"
                width={1024}
                height={768}
                className="h-28 w-full rounded-xl object-cover sm:size-28"
              />
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-base font-semibold">{item.name}</h2>
                    {item.options.length > 0 && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.options.map((o) => o.label).join(" · ")}
                      </p>
                    )}
                    {item.notes && (
                      <p className="mt-1 text-xs italic text-muted-foreground">“{item.notes}”</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${item.name}`}
                    onClick={() => {
                      remove(item.key);
                      toast.success(`${item.name} removed from cart.`);
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1 rounded-xl border border-border p-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Decrease quantity"
                      onClick={() => setQuantity(item.key, item.quantity - 1)}
                    >
                      <Minus className="size-4" />
                    </Button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Increase quantity"
                      onClick={() => setQuantity(item.key, item.quantity + 1)}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                  <span className="font-display text-lg font-bold text-primary">
                    {formatPKR(item.unitPrice * item.quantity)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-soft lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-semibold">Order summary</h2>
          <div className="mt-4">
            <OrderSummary totals={totals} />
          </div>
          <Button asChild size="lg" className="mt-6 w-full">
            <Link to="/checkout">Proceed to Checkout</Link>
          </Button>
          <Button asChild variant="ghost" className="mt-2 w-full">
            <Link to="/menu">Add more items</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
