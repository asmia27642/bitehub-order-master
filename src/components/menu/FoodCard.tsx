import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/site/StarRating";
import { formatPKR } from "@/lib/format";
import type { MenuItem } from "@/lib/types";

export function FoodCard({ item, onOpen }: { item: MenuItem; onOpen: (item: MenuItem) => void }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-lift">
      <button
        type="button"
        onClick={() => onOpen(item)}
        className="relative aspect-[4/3] w-full overflow-hidden text-left focus-visible:outline-2 focus-visible:outline-ring"
        aria-label={`View ${item.name}`}
      >
        <img
          src={item.image ?? "/images/hero.jpg"}
          alt={item.name}
          loading="lazy"
          width={1024}
          height={768}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          {item.is_featured && <Badge className="bg-accent text-accent-foreground">Featured</Badge>}
          {!item.is_available && <Badge variant="destructive">Sold out</Badge>}
        </div>
      </button>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-base font-semibold leading-tight">{item.name}</h3>
          <StarRating rating={item.rating} />
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <span className="font-display text-lg font-bold text-primary">
            {formatPKR(Number(item.price))}
          </span>
          <Button size="sm" disabled={!item.is_available} onClick={() => onOpen(item)}>
            <Plus className="size-4" /> Add
          </Button>
        </div>
      </div>
    </article>
  );
}

export function FoodCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="aspect-[4/3] w-full animate-pulse bg-muted" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
        <div className="h-8 w-full animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
