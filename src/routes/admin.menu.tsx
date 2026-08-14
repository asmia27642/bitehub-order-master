import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { categoriesQuery, menuItemsQuery, useInvalidateMenu } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { formatPKR } from "@/lib/format";
import type { MenuItem } from "@/lib/types";

export const Route = createFileRoute("/admin/menu")({
  component: AdminMenu,
});

interface FormState {
  id?: string;
  name: string;
  description: string;
  price: string;
  image: string;
  category_id: string;
  ingredients: string;
  is_featured: boolean;
  is_available: boolean;
}

const empty: FormState = {
  name: "",
  description: "",
  price: "",
  image: "",
  category_id: "",
  ingredients: "",
  is_featured: false,
  is_available: true,
};

function AdminMenu() {
  const { data: items = [], isLoading } = useQuery(menuItemsQuery(true));
  const { data: categories = [] } = useQuery(categoriesQuery(true));
  const invalidate = useInvalidateMenu();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [filter, setFilter] = useState("all");

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const startCreate = () => {
    setForm({ ...empty, category_id: categories[0]?.id ?? "" });
    setOpen(true);
  };

  const startEdit = (item: MenuItem) => {
    setForm({
      id: item.id,
      name: item.name,
      description: item.description,
      price: String(item.price),
      image: item.image ?? "",
      category_id: item.category_id ?? "",
      ingredients: item.ingredients.join(", "),
      is_featured: item.is_featured,
      is_available: item.is_available,
    });
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price) || 0,
      image: form.image.trim() || null,
      category_id: form.category_id || null,
      ingredients: form.ingredients
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      is_featured: form.is_featured,
      is_available: form.is_available,
    };
    const query = form.id
      ? supabase.from("menu_items").update(payload as never).eq("id", form.id)
      : supabase.from("menu_items").insert(payload as never);
    const { error } = await query;
    if (error) {
      toast.error(error.message);
      return;
    }
    invalidate();
    setOpen(false);
    toast.success(form.id ? "Item updated." : "Item added.");
  };

  const toggleAvailable = async (item: MenuItem, value: boolean) => {
    const { error } = await supabase
      .from("menu_items")
      .update({ is_available: value })
      .eq("id", item.id);
    if (error) {
      toast.error("Couldn't update availability.");
      return;
    }
    invalidate();
  };

  const remove = async (item: MenuItem) => {
    const { error } = await supabase.from("menu_items").delete().eq("id", item.id);
    if (error) {
      toast.error("Couldn't delete this item.");
      return;
    }
    invalidate();
    toast.success("Item deleted.");
  };

  const visible = items.filter((i) => filter === "all" || i.category_id === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Menu Items</h1>
          <p className="mt-1 text-sm text-muted-foreground">{items.length} dishes on the menu.</p>
        </div>
        <div className="flex gap-3">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={startCreate}>
            <Plus className="size-4" /> New item
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {visible.map((item) => (
            <li
              key={item.id}
              className="flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft"
            >
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  className="size-20 rounded-xl object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-display font-semibold">{item.name}</p>
                  {item.is_featured && <Badge variant="secondary">Featured</Badge>}
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {item.description}
                </p>
                <p className="mt-2 font-semibold">{formatPKR(Number(item.price))}</p>
              </div>
              <div className="flex flex-col items-end justify-between">
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => startEdit(item)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => void remove(item)}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
                <Switch
                  checked={item.is_available}
                  onCheckedChange={(v) => void toggleAvailable(item, v)}
                  aria-label={`Toggle ${item.name} availability`}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit item" : "New item"}</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={save}>
            <div className="space-y-2">
              <Label htmlFor="iname">Name</Label>
              <Input
                id="iname"
                required
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="idesc">Description</Label>
              <Textarea
                id="idesc"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="iprice">Price (Rs.)</Label>
                <Input
                  id="iprice"
                  type="number"
                  min={0}
                  required
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="icat">Category</Label>
                <Select value={form.category_id} onValueChange={(v) => set("category_id", v)}>
                  <SelectTrigger id="icat">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="iimg">Image URL</Label>
              <Input
                id="iimg"
                value={form.image}
                onChange={(e) => set("image", e.target.value)}
                placeholder="/images/menu/burger.jpg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="iing">Ingredients (comma separated)</Label>
              <Input
                id="iing"
                value={form.ingredients}
                onChange={(e) => set("ingredients", e.target.value)}
              />
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={form.is_featured}
                  onCheckedChange={(v) => set("is_featured", v)}
                />
                Featured
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={form.is_available}
                  onCheckedChange={(v) => set("is_available", v)}
                />
                Available
              </label>
            </div>
            <Button type="submit" className="w-full">
              {form.id ? "Save changes" : "Create item"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
