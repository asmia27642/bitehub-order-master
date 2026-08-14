import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartItem, MenuItem, SelectedOption } from "@/lib/types";

const STORAGE_KEY = "bitehub.cart.v1";

interface CartValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (item: MenuItem, options: SelectedOption[], quantity: number, notes?: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartValue | null>(null);

function makeKey(itemId: string, options: SelectedOption[], notes?: string) {
  const opts = [...options].map((o) => `${o.group}:${o.label}`).sort().join("|");
  return `${itemId}__${opts}__${notes ?? ""}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore malformed cart */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const value = useMemo<CartValue>(() => {
    const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    return {
      items,
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal,
      add: (item, options, quantity, notes) => {
        const unitPrice = Number(item.price) + options.reduce((s, o) => s + o.price, 0);
        const key = makeKey(item.id, options, notes);
        setItems((prev) => {
          const found = prev.find((p) => p.key === key);
          if (found) {
            return prev.map((p) => (p.key === key ? { ...p, quantity: p.quantity + quantity } : p));
          }
          return [
            ...prev,
            {
              key,
              itemId: item.id,
              name: item.name,
              image: item.image,
              basePrice: Number(item.price),
              unitPrice,
              quantity,
              options,
              notes: notes ?? "",
            },
          ];
        });
      },
      setQuantity: (key, quantity) =>
        setItems((prev) =>
          quantity <= 0
            ? prev.filter((p) => p.key !== key)
            : prev.map((p) => (p.key === key ? { ...p, quantity } : p)),
        ),
      remove: (key) => setItems((prev) => prev.filter((p) => p.key !== key)),
      clear: () => setItems([]),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
