import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, UtensilsCrossed, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FoodCard, FoodCardSkeleton } from "@/components/menu/FoodCard";
import { ItemDialog } from "@/components/menu/ItemDialog";
import { EmptyState } from "@/components/site/EmptyState";
import { categoriesQuery, menuItemsQuery } from "@/lib/queries";
import { formatPKR } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/lib/types";

interface MenuSearch {
  category?: string;
  q?: string;
  sort?: string;
  maxPrice?: number;
  minRating?: number;
}

const DEFAULTS = {
  category: "all",
  q: "",
  sort: "popular",
  maxPrice: 2000,
  minRating: 0,
} satisfies Required<MenuSearch>;

export const Route = createFileRoute("/menu/")({
  validateSearch: (raw: Record<string, unknown>): MenuSearch => ({
    category: typeof raw["category"] === "string" ? raw["category"] : DEFAULTS.category,
    q: typeof raw["q"] === "string" ? raw["q"] : DEFAULTS.q,
    sort: typeof raw["sort"] === "string" ? raw["sort"] : DEFAULTS.sort,
    maxPrice: Number(raw["maxPrice"]) || DEFAULTS.maxPrice,
    minRating: Number(raw["minRating"]) || DEFAULTS.minRating,
  }),
  head: () => ({
    meta: [
      { title: "Menu — BiteHub" },
      {
        name: "description",
        content:
          "Browse the full BiteHub menu: burgers, pizza, fried chicken, pasta, appetizers, desserts and drinks.",
      },
      { property: "og:title", content: "The BiteHub Menu" },
      {
        property: "og:description",
        content: "Search, filter and order from the full BiteHub menu in Pakistani Rupees.",
      },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const raw = Route.useSearch();
  const search = { ...DEFAULTS, ...raw };
  const navigate = useNavigate();
  const { data: items, isLoading, isError } = useQuery(menuItemsQuery());
  const { data: categories } = useQuery(categoriesQuery());
  const [selected, setSelected] = useState<MenuItem | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const update = (patch: MenuSearch) =>
    void navigate({ to: "/menu", search: { ...search, ...patch } });

  const filtered = useMemo(() => {
    const term = search.q.trim().toLowerCase();
    let list = (items ?? []).filter((item) => {
      const cat = item.categories?.slug ?? "";
      if (search.category !== "all" && cat !== search.category) return false;
      if (Number(item.price) > search.maxPrice) return false;
      if (Number(item.rating) < search.minRating) return false;
      if (!term) return true;
      return (
        item.name.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        (item.categories?.name ?? "").toLowerCase().includes(term)
      );
    });
    list = [...list].sort((a, b) => {
      if (search.sort === "price-asc") return Number(a.price) - Number(b.price);
      if (search.sort === "price-desc") return Number(b.price) - Number(a.price);
      if (search.sort === "rating") return Number(b.rating) - Number(a.rating);
      return b.popularity - a.popularity;
    });
    return list;
  }, [items, search]);

  const filtersActive =
    search.category !== "all" ||
    search.q !== "" ||
    search.sort !== "popular" ||
    search.maxPrice !== DEFAULTS.maxPrice ||
    search.minRating !== 0;

  return (
    <div className="container-page py-10">
      <header className="max-w-2xl">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Our menu</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Everything is cooked fresh to order. Prices in Pakistani Rupees.
        </p>
      </header>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search.q}
            onChange={(e) => update({ q: e.target.value })}
            placeholder="Search dishes, categories or ingredients…"
            aria-label="Search the menu"
            className="pl-9"
          />
        </div>
        <Select value={search.sort} onValueChange={(v) => update({ sort: v })}>
          <SelectTrigger className="sm:w-52" aria-label="Sort menu">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Most popular</SelectItem>
            <SelectItem value="rating">Highest rated</SelectItem>
            <SelectItem value="price-asc">Price: low to high</SelectItem>
            <SelectItem value="price-desc">Price: high to low</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => setShowFilters((v) => !v)}>
          <SlidersHorizontal className="size-4" /> Filters
        </Button>
      </div>

      {showFilters && (
        <div className="mt-4 grid gap-6 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2">
          <div>
            <Label className="text-sm font-semibold">
              Max price · {formatPKR(search.maxPrice)}
            </Label>
            <Slider
              className="mt-4"
              min={200}
              max={2000}
              step={50}
              value={[search.maxPrice]}
              onValueChange={([v]) => update({ maxPrice: v ?? DEFAULTS.maxPrice })}
            />
          </div>
          <div>
            <Label className="text-sm font-semibold">Minimum rating · {search.minRating}+</Label>
            <Slider
              className="mt-4"
              min={0}
              max={5}
              step={0.5}
              value={[search.minRating]}
              onValueChange={([v]) => update({ minRating: v ?? 0 })}
            />
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <CategoryTab
          active={search.category === "all"}
          onClick={() => update({ category: "all" })}
          label="All"
        />
        {(categories ?? []).map((cat) => (
          <CategoryTab
            key={cat.id}
            active={search.category === cat.slug}
            onClick={() => update({ category: cat.slug })}
            label={cat.name}
          />
        ))}
        {filtersActive && (
          <Button variant="ghost" size="sm" onClick={() => update(DEFAULTS)}>
            <X className="size-4" /> Clear filters
          </Button>
        )}
      </div>

      <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
        {isLoading ? "Loading dishes…" : `${filtered.length} dishes`}
      </p>

      <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading && Array.from({ length: 8 }).map((_, i) => <FoodCardSkeleton key={i} />)}
        {!isLoading &&
          filtered.map((item) => <FoodCard key={item.id} item={item} onOpen={setSelected} />)}
      </div>

      {isError && (
        <EmptyState
          title="We couldn't load the menu"
          description="Please check your connection and try again."
          action={<Button onClick={() => window.location.reload()}>Retry</Button>}
        />
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          icon={<UtensilsCrossed className="size-6" />}
          title="No dishes match your search"
          description="Try a different keyword or reset the filters to see the full menu."
          action={<Button onClick={() => update(DEFAULTS)}>Clear filters</Button>}
        />
      )}

      <ItemDialog item={selected} onOpenChange={(o) => !o && setSelected(null)} />
    </div>
  );
}

function CategoryTab({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
