export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface OptionChoice {
  label: string;
  price: number;
}

export interface OptionGroup {
  name: string;
  type: "single" | "multi";
  choices: OptionChoice[];
}

export interface MenuItem {
  id: string;
  category_id: string | null;
  name: string;
  description: string;
  price: number;
  image: string | null;
  ingredients: string[];
  rating: number;
  is_available: boolean;
  is_featured: boolean;
  popularity: number;
  options: OptionGroup[];
  created_at: string;
  categories?: { name: string; slug: string } | null;
}

export interface SelectedOption {
  group: string;
  label: string;
  price: number;
}

export interface CartItem {
  key: string;
  itemId: string;
  name: string;
  image: string | null;
  basePrice: number;
  unitPrice: number;
  quantity: number;
  options: SelectedOption[];
  notes: string;
}

export interface OrderRow {
  id: string;
  code: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  order_status: string;
  order_type: string;
  payment_method: string;
  subtotal: number;
  delivery_fee: number;
  tax: number;
  discount: number;
  total: number;
  delivery_address: string | null;
  city: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItemRow[];
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  name: string;
  image: string | null;
  quantity: number;
  price: number;
  selected_options: SelectedOption[];
  notes: string | null;
}

export interface Review {
  id: string;
  user_id: string | null;
  menu_item_id: string | null;
  author_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  created_at: string;
}
