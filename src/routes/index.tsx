import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight, BadgePercent, Clock, Flame, Star, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FoodCard, FoodCardSkeleton } from "@/components/menu/FoodCard";
import { ItemDialog } from "@/components/menu/ItemDialog";
import { menuItemsQuery, categoriesQuery, reviewsQuery } from "@/lib/queries";
import type { MenuItem } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BiteHub — Burgers, Pizza & Fried Chicken Delivered" },
      {
        name: "description",
        content:
          "Order flame-grilled burgers, stone-baked pizza and crispy fried chicken from BiteHub. Fast delivery or pickup in Karachi.",
      },
      { property: "og:title", content: "BiteHub — Order food online" },
      {
        property: "og:description",
        content: "Flame-grilled burgers, stone-baked pizza and comfort classics, delivered hot.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { data: items, isLoading } = useQuery(menuItemsQuery());
  const { data: categories } = useQuery(categoriesQuery());
  const { data: reviews } = useQuery(reviewsQuery());
  const [selected, setSelected] = useState<MenuItem | null>(null);

  const featured = (items ?? []).filter((i) => i.is_featured).slice(0, 4);
  const bestSellers = [...(items ?? [])].sort((a, b) => b.popularity - a.popularity).slice(0, 4);

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <img
          src="/images/hero.jpg"
          alt="A spread of burgers, pizza, fried chicken and drinks"
          width={1600}
          height={1000}
          className="absolute inset-0 -z-10 size-full object-cover"
        />
        <div className="hero-overlay absolute inset-0 -z-10" />
        <div className="container-page flex min-h-[78vh] flex-col justify-center py-20">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/40 bg-background/10 px-4 py-1.5 text-sm font-medium text-accent backdrop-blur">
            <Flame className="size-4" /> Freshly cooked, every order
          </span>
          <h1 className="mt-6 max-w-2xl font-display text-4xl font-extrabold leading-[1.05] text-primary-foreground sm:text-6xl">
            Real food, <span className="text-gradient-warm">seriously fast.</span>
          </h1>
          <p className="mt-5 max-w-lg text-base text-primary-foreground/80 sm:text-lg">
            Flame-grilled burgers, stone-baked pizza and crispy fried chicken — made to order and at
            your door in 30 minutes.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/menu">
                Order Now <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/menu" search={{ category: "burgers" }}>
                Browse Burgers
              </Link>
            </Button>
          </div>

          <dl className="mt-12 grid max-w-2xl grid-cols-2 gap-6 sm:grid-cols-3">
            {[
              { icon: Truck, label: "Flat Rs. 150 delivery" },
              { icon: Clock, label: "30 min average" },
              { icon: Star, label: "4.8 average rating" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 text-primary-foreground/85">
                <Icon className="size-5 text-accent" />
                <dt className="text-sm font-medium">{label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="container-page py-16">
        <SectionHeading
          eyebrow="Categories"
          title="Popular categories"
          description="Every dish is cooked to order by our kitchen team."
        />
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {(categories ?? []).map((cat) => (
            <Link
              key={cat.id}
              to="/menu"
              search={{ category: cat.slug }}
              className="group relative overflow-hidden rounded-2xl border border-border shadow-soft transition-transform hover:-translate-y-1"
            >
              <img
                src={cat.image ?? "/images/hero.jpg"}
                alt={cat.name}
                loading="lazy"
                width={1024}
                height={768}
                className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <span className="hero-overlay absolute inset-0" />
              <span className="absolute inset-x-0 bottom-0 p-3 text-sm font-semibold text-primary-foreground">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page py-8">
        <SectionHeading
          eyebrow="Chef's picks"
          title="Featured dishes"
          description="The plates our kitchen is proudest of right now."
        />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <FoodCardSkeleton key={i} />)
            : featured.map((item) => (
                <FoodCard key={item.id} item={item} onOpen={setSelected} />
              ))}
        </div>
      </section>

      <section className="container-page py-8">
        <SectionHeading
          eyebrow="Loved by the city"
          title="Best sellers"
          description="Ordered again and again, week after week."
        />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <FoodCardSkeleton key={i} />)
            : bestSellers.map((item) => (
                <FoodCard key={item.id} item={item} onOpen={setSelected} />
              ))}
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid gap-4 rounded-3xl bg-sidebar p-8 text-sidebar-foreground sm:grid-cols-3 sm:p-12">
          <div className="sm:col-span-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-sidebar-accent px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              <BadgePercent className="size-4" /> Special offer
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">
              Get 10% off your first order
            </h2>
            <p className="mt-3 max-w-lg text-sm text-sidebar-foreground/75">
              Use promo code <strong className="text-accent">BITE10</strong> at checkout. Valid on
              delivery and pickup orders.
            </p>
            <Button asChild size="lg" className="mt-6">
              <Link to="/menu">Start your order</Link>
            </Button>
          </div>
          <div className="hidden items-center justify-center sm:flex">
            <img
              src="/images/cat-burgers.jpg"
              alt="Signature BiteHub burger"
              loading="lazy"
              width={1024}
              height={768}
              className="size-40 rounded-2xl object-cover shadow-lift"
            />
          </div>
        </div>
      </section>

      <section className="container-page py-8">
        <SectionHeading
          eyebrow="Reviews"
          title="What our customers say"
          description="Straight from the people who eat with us."
        />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {(reviews ?? []).slice(0, 4).map((r) => (
            <figure
              key={r.id}
              className="rounded-2xl border border-border bg-card p-6 shadow-soft"
            >
              <div className="flex gap-1">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} className="size-4 fill-accent text-accent" />
                ))}
              </div>
              <blockquote className="mt-4 text-sm text-muted-foreground">“{r.comment}”</blockquote>
              <figcaption className="mt-4 text-sm font-semibold">{r.author_name}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <ItemDialog item={selected} onOpenChange={(o) => !o && setSelected(null)} />
    </>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>
      <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">{title}</h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
