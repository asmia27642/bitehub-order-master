import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ItemCustomizer } from "@/components/menu/ItemCustomizer";
import { EmptyState } from "@/components/site/EmptyState";
import { menuItemQuery, reviewsQuery } from "@/lib/queries";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/menu/$id")({
  head: () => ({
    meta: [
      { title: "Dish details — BiteHub" },
      {
        name: "description",
        content: "See ingredients, customization options and reviews before you order.",
      },
      { property: "og:title", content: "Dish details — BiteHub" },
      {
        property: "og:description",
        content: "Customize your dish and add it straight to your BiteHub cart.",
      },
    ],
  }),
  component: ItemPage,
});

function ItemPage() {
  const { id } = Route.useParams();
  const { data: item, isLoading } = useQuery(menuItemQuery(id));
  const { data: reviews } = useQuery(reviewsQuery(id));

  if (isLoading) {
    return (
      <div className="container-page grid gap-10 py-10 lg:grid-cols-2">
        <div className="aspect-[4/3] w-full animate-pulse rounded-2xl bg-muted" />
        <div className="space-y-4">
          <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-40 w-full animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title="Dish not found"
          description="This item may have been removed from the menu."
          action={
            <Button asChild>
              <Link to="/menu">Browse menu</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link to="/menu">
          <ArrowLeft className="size-4" /> Back to menu
        </Link>
      </Button>

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <img
            src={item.image ?? "/images/hero.jpg"}
            alt={item.name}
            width={1024}
            height={768}
            className="w-full rounded-3xl object-cover shadow-lift"
          />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            {item.categories?.name ?? "Menu"}
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">{item.name}</h1>
          <div className="mt-6">
            <ItemCustomizer item={item} />
          </div>
        </div>
      </div>

      <section className="mt-16 max-w-3xl">
        <h2 className="font-display text-2xl font-bold">Reviews</h2>
        {(reviews ?? []).length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No reviews yet for this dish — be the first to try it.
          </p>
        ) : (
          <ul className="mt-6 space-y-4">
            {(reviews ?? []).map((r) => (
              <li key={r.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold">{r.author_name}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(r.created_at)}</span>
                </div>
                <div className="mt-2 flex gap-1">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="size-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{r.comment}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
