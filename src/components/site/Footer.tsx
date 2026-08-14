import { Link } from "@tanstack/react-router";
import { Clock, MapPin, Phone, UtensilsCrossed } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-secondary/50">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <UtensilsCrossed className="size-5" />
            </span>
            <span className="font-display text-xl font-bold">BiteHub</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Flame-grilled burgers, stone-baked pizza and comfort classics — cooked to order and
            delivered hot across the city.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide">Explore</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/menu" className="hover:text-foreground">
                Full Menu
              </Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-foreground">
                Your Cart
              </Link>
            </li>
            <li>
              <Link to="/orders" className="hover:text-foreground">
                My Orders
              </Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-foreground">
                Sign in
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide">Visit us</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" /> 24-C Zamzama Boulevard,
              Karachi
            </li>
            <li className="flex gap-2">
              <Phone className="mt-0.5 size-4 shrink-0 text-primary" /> 0311-2345678
            </li>
            <li className="flex gap-2">
              <Clock className="mt-0.5 size-4 shrink-0 text-primary" /> Daily · 12:00 PM – 2:00 AM
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide">Delivery</h3>
          <p className="mt-4 text-sm text-muted-foreground">
            Flat Rs. 150 delivery fee within city limits. Free pickup available at the counter,
            usually ready in 15–20 minutes.
          </p>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} BiteHub. All rights reserved.
      </div>
    </footer>
  );
}
