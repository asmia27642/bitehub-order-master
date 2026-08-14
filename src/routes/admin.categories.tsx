import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { categoriesQuery, useInvalidateMenu } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import type { Category } from "@/lib/types";

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategories,
});

const empty = { name: "", slug: "", description: "", image: "", sort_order: 0 };

function AdminCategories() {
  const { data: categories = [], isLoading } = useQuery(categoriesQuery(true));
  const invalidate = useInvalidateMenu();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);

  const set = (k: keyof typeof form, v: string | number) => setForm((p) => ({ ...p, [k]: v }));

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = (form.slug || form.name).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const { error } = await supabase.from("categories").insert({
      name: form.name.trim(),
      slug,
      description: form.description.trim() || null,
      image: form.image.trim() || null,
      sort_order: Number(form.sort_order) || categories.length + 1,
    } as never);
    if (error) {
      toast.error(error.message);
      return;
    }
    invalidate();
    setForm(empty);
    setOpen(false);
    toast.success("Category added.");
  };

  const toggle = async (c: Category, value: boolean) => {
    const { error } = await supabase
      .from("categories")
      .update({ is_active: value })
      .eq("id", c.id);
    if (error) {
      toast.error("Couldn't update category.");
      return;
    }
    invalidate();
  };

  const remove = async (c: Category) => {
    const { error } = await supabase.from("categories").delete().eq("id", c.id);
    if (error) {
      toast.error("Category is in use and can't be deleted.");
      return;
    }
    invalidate();
    toast.success("Category deleted.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">Organise the menu into sections.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4" /> New category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New category</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={create}>
              <div className="space-y-2">
                <Label htmlFor="cname">Name</Label>
                <Input
                  id="cname"
                  required
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cdesc">Description</Label>
                <Input
                  id="cdesc"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cimg">Image URL</Label>
                <Input
                  id="cimg"
                  value={form.image}
                  onChange={(e) => set("image", e.target.value)}
                  placeholder="/images/categories/burgers.jpg"
                />
              </div>
              <Button type="submit" className="w-full">
                Create category
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {categories.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft"
            >
              {c.image && (
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  className="size-16 rounded-xl object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-display font-semibold">{c.name}</p>
                <p className="truncate text-xs text-muted-foreground">{c.description ?? c.slug}</p>
              </div>
              <Switch
                checked={c.is_active}
                onCheckedChange={(v) => void toggle(c, v)}
                aria-label={`Toggle ${c.name}`}
              />
              <Button variant="ghost" size="icon" onClick={() => void remove(c)}>
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
