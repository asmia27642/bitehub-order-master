import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, ListOrdered, ShoppingBag, Tags, Users, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/site/EmptyState";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin dashboard — BiteHub" },
      { name: "description", content: "Manage BiteHub menu, categories, orders and customers." },
      { property: "og:title", content: "Admin dashboard — BiteHub" },
      { property: "og:description", content: "Restaurant operations control centre." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/orders", label: "Orders", icon: ListOrdered, exact: false },
  { to: "/admin/menu", label: "Menu Items", icon: ShoppingBag, exact: false },
  { to: "/admin/categories", label: "Categories", icon: Tags, exact: false },
  { to: "/admin/customers", label: "Customers", icon: Users, exact: false },
] as const;

function AdminLayout() {
  const { isAdmin, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container-page py-16">
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={<ShieldAlert className="size-6" />}
          title="Admin access required"
          description="Sign in with the restaurant admin account to open the dashboard."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link to="/login" search={{ redirect: "/admin" }}>
                  Sign in
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/profile">Claim admin access</Link>
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-2xl border border-border bg-card p-3 shadow-soft lg:sticky lg:top-24">
          <nav className="flex gap-1 overflow-x-auto lg:flex-col">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.exact }}
                activeProps={{ className: "bg-primary text-primary-foreground" }}
                className="flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary"
              >
                <n.icon className="size-4" />
                {n.label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
