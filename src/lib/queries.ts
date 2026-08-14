import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Category, MenuItem, OrderRow, Profile, Review } from "./types";

/* ---------------------------------- menu --------------------------------- */

export const categoriesQuery = (includeInactive = false) => ({
  queryKey: ["categories", includeInactive],
  queryFn: async (): Promise<Category[]> => {
    let q = supabase.from("categories").select("*").order("sort_order");
    if (!includeInactive) q = q.eq("is_active", true);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as unknown as Category[];
  },
});

export const menuItemsQuery = (includeUnavailable = false) => ({
  queryKey: ["menu_items", includeUnavailable],
  queryFn: async (): Promise<MenuItem[]> => {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*, categories(name, slug)")
      .order("created_at");
    if (error) throw error;
    const rows = (data ?? []) as unknown as MenuItem[];
    return includeUnavailable ? rows : rows.filter((r) => r.is_available);
  },
});

export const menuItemQuery = (id: string) => ({
  queryKey: ["menu_item", id],
  queryFn: async (): Promise<MenuItem | null> => {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*, categories(name, slug)")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return (data as unknown as MenuItem) ?? null;
  },
});

export const reviewsQuery = (menuItemId?: string) => ({
  queryKey: ["reviews", menuItemId ?? "all"],
  queryFn: async (): Promise<Review[]> => {
    let q = supabase.from("reviews").select("*").order("created_at", { ascending: false });
    if (menuItemId) q = q.eq("menu_item_id", menuItemId);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as unknown as Review[];
  },
});

/* --------------------------------- orders -------------------------------- */

export const myOrdersQuery = (userId?: string) => ({
  queryKey: ["orders", "mine", userId],
  enabled: Boolean(userId),
  queryFn: async (): Promise<OrderRow[]> => {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as OrderRow[];
  },
});

export const orderQuery = (id: string) => ({
  queryKey: ["order", id],
  queryFn: async (): Promise<OrderRow | null> => {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return (data as unknown as OrderRow) ?? null;
  },
});

export const allOrdersQuery = () => ({
  queryKey: ["orders", "all"],
  queryFn: async (): Promise<OrderRow[]> => {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as OrderRow[];
  },
});

export const customersQuery = () => ({
  queryKey: ["profiles"],
  queryFn: async (): Promise<Profile[]> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as Profile[];
  },
});

/* -------------------------------- mutations ------------------------------- */

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("orders")
        .update({ order_status: status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["orders"] });
      void qc.invalidateQueries({ queryKey: ["order"] });
    },
  });
}

export function useInvalidateMenu() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: ["menu_items"] });
    void qc.invalidateQueries({ queryKey: ["menu_item"] });
    void qc.invalidateQueries({ queryKey: ["categories"] });
  };
}

export function useMenuList(includeUnavailable = false) {
  return useQuery(menuItemsQuery(includeUnavailable));
}

export function useCategories(includeInactive = false) {
  return useQuery(categoriesQuery(includeInactive));
}
