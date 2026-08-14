
-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin','customer');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'admin')) WITH CHECK (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own roles read" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, phone)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name',''), COALESCE(NEW.email,''), NEW.raw_user_meta_data->>'phone')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer') ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- CATALOG
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  image text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories admin write" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 0,
  image text,
  ingredients text[] NOT NULL DEFAULT '{}',
  rating numeric(2,1) NOT NULL DEFAULT 4.5,
  is_available boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  popularity int NOT NULL DEFAULT 0,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.menu_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.menu_items TO authenticated;
GRANT ALL ON public.menu_items TO service_role;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "menu public read" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "menu admin write" ON public.menu_items FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  label text NOT NULL DEFAULT 'Home',
  address text NOT NULL,
  city text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.addresses TO authenticated;
GRANT ALL ON public.addresses TO service_role;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own addresses" ON public.addresses FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ORDERS
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE DEFAULT ('BH-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,6))),
  user_id uuid,
  customer_name text NOT NULL DEFAULT '',
  customer_email text NOT NULL DEFAULT '',
  customer_phone text NOT NULL DEFAULT '',
  order_status text NOT NULL DEFAULT 'pending',
  order_type text NOT NULL DEFAULT 'delivery',
  payment_method text NOT NULL DEFAULT 'cod',
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  delivery_fee numeric(10,2) NOT NULL DEFAULT 0,
  tax numeric(10,2) NOT NULL DEFAULT 0,
  discount numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  delivery_address text,
  city text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders own read" ON public.orders FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "orders own insert" ON public.orders FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "orders admin update" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES public.menu_items(id) ON DELETE SET NULL,
  name text NOT NULL,
  image text,
  quantity int NOT NULL DEFAULT 1,
  price numeric(10,2) NOT NULL DEFAULT 0,
  selected_options jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text
);
GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order items read" ON public.order_items FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));
CREATE POLICY "order items insert" ON public.order_items FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  menu_item_id uuid REFERENCES public.menu_items(id) ON DELETE CASCADE,
  author_name text NOT NULL DEFAULT 'Guest',
  rating int NOT NULL DEFAULT 5,
  comment text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews public read" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews own insert" ON public.reviews FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "reviews delete" ON public.reviews FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- SEED
INSERT INTO public.categories (name, slug, description, image, sort_order) VALUES
 ('Burgers','burgers','Flame-grilled smash burgers','/images/cat-burgers.jpg',1),
 ('Pizza','pizza','Stone-baked, hand stretched','/images/cat-pizza.jpg',2),
 ('Chicken','chicken','Crispy fried & grilled chicken','/images/cat-chicken.jpg',3),
 ('Pasta','pasta','Creamy and classic pastas','/images/cat-pasta.jpg',4),
 ('Appetizers','appetizers','Loaded sides and starters','/images/cat-appetizers.jpg',5),
 ('Desserts','desserts','Sweet finishes','/images/cat-desserts.jpg',6),
 ('Drinks','drinks','Cold, fresh and fizzy','/images/cat-drinks.jpg',7);

INSERT INTO public.menu_items (category_id, name, description, price, image, ingredients, rating, is_featured, popularity, options)
SELECT c.id, v.name, v.description, v.price, v.image, v.ingredients, v.rating, v.is_featured, v.popularity, v.options::jsonb
FROM (VALUES
 ('Burgers','Classic Beef Burger','Juicy beef patty, cheddar, lettuce, tomato and our signature sauce.',799,'/images/cat-burgers.jpg',ARRAY['Beef patty','Cheddar','Lettuce','Tomato','Brioche bun'],4.8,true,98,'[{"name":"Size","type":"single","choices":[{"label":"Single","price":0},{"label":"Double","price":250}]},{"name":"Extras","type":"multi","choices":[{"label":"Extra Cheese","price":100},{"label":"Extra Patty","price":250},{"label":"Add Sauce","price":50},{"label":"Remove Onion","price":0}]}]'),
 ('Burgers','Smoky BBQ Burger','Smoked beef, crispy onions and tangy BBQ glaze.',899,'/images/cat-burgers.jpg',ARRAY['Beef patty','BBQ sauce','Crispy onion','Cheddar'],4.7,true,80,'[{"name":"Size","type":"single","choices":[{"label":"Single","price":0},{"label":"Double","price":280}]},{"name":"Extras","type":"multi","choices":[{"label":"Extra Cheese","price":100},{"label":"Jalapenos","price":80}]}]'),
 ('Burgers','Zinger Chicken Burger','Crunchy fried chicken fillet with spicy mayo.',749,'/images/cat-burgers.jpg',ARRAY['Chicken fillet','Spicy mayo','Lettuce'],4.6,false,72,'[{"name":"Extras","type":"multi","choices":[{"label":"Extra Cheese","price":100},{"label":"Extra Fillet","price":230}]}]'),
 ('Burgers','Mushroom Swiss Burger','Sauteed mushrooms and melted swiss cheese.',949,'/images/cat-burgers.jpg',ARRAY['Beef patty','Mushroom','Swiss cheese'],4.5,false,44,'[]'),
 ('Pizza','Chicken Tikka Pizza','Desi spiced chicken tikka, onion and peppers.',1299,'/images/cat-pizza.jpg',ARRAY['Chicken tikka','Mozzarella','Onion','Capsicum'],4.9,true,120,'[{"name":"Size","type":"single","choices":[{"label":"Small","price":0},{"label":"Medium","price":400},{"label":"Large","price":800}]},{"name":"Crust","type":"single","choices":[{"label":"Hand Tossed","price":0},{"label":"Stuffed Crust","price":250}]}]'),
 ('Pizza','Pepperoni Classic','Loaded pepperoni over rich tomato base.',1399,'/images/cat-pizza.jpg',ARRAY['Pepperoni','Mozzarella','Tomato sauce'],4.7,true,95,'[{"name":"Size","type":"single","choices":[{"label":"Small","price":0},{"label":"Medium","price":400},{"label":"Large","price":800}]}]'),
 ('Pizza','Margherita','Simple, fresh basil and buffalo mozzarella.',999,'/images/cat-pizza.jpg',ARRAY['Mozzarella','Basil','Tomato'],4.4,false,60,'[{"name":"Size","type":"single","choices":[{"label":"Small","price":0},{"label":"Medium","price":350}]}]'),
 ('Pizza','Fajita Sicilian','Peri peri chicken fajita with jalapenos.',1449,'/images/cat-pizza.jpg',ARRAY['Chicken fajita','Jalapeno','Cheese'],4.6,false,58,'[]'),
 ('Chicken','Crispy Fried Chicken (5 pcs)','Golden buttermilk fried chicken, crunchy every bite.',1099,'/images/cat-chicken.jpg',ARRAY['Chicken','Buttermilk','Secret spice mix'],4.8,true,110,'[{"name":"Spice","type":"single","choices":[{"label":"Original","price":0},{"label":"Hot & Spicy","price":0}]}]'),
 ('Chicken','Grilled Peri Peri Half','Char-grilled half chicken with peri peri glaze.',1249,'/images/cat-chicken.jpg',ARRAY['Chicken','Peri peri','Herbs'],4.7,false,70,'[]'),
 ('Chicken','Chicken Wings (8 pcs)','Tossed in buffalo or honey mustard.',899,'/images/cat-chicken.jpg',ARRAY['Chicken wings','Buffalo sauce'],4.6,true,88,'[{"name":"Sauce","type":"single","choices":[{"label":"Buffalo","price":0},{"label":"Honey Mustard","price":0},{"label":"BBQ","price":0}]}]'),
 ('Pasta','Creamy Alfredo Pasta','Silky parmesan cream sauce with grilled chicken.',1099,'/images/cat-pasta.jpg',ARRAY['Fettuccine','Cream','Parmesan','Chicken'],4.6,true,76,'[{"name":"Add-ons","type":"multi","choices":[{"label":"Extra Chicken","price":250},{"label":"Extra Cheese","price":120}]}]'),
 ('Pasta','Spicy Arrabbiata','Chilli tomato sauce with garlic and herbs.',949,'/images/cat-pasta.jpg',ARRAY['Penne','Tomato','Chilli','Garlic'],4.4,false,50,'[]'),
 ('Pasta','Baked Mac & Cheese','Four cheese blend baked golden.',999,'/images/cat-pasta.jpg',ARRAY['Macaroni','Cheddar','Mozzarella'],4.5,false,48,'[]'),
 ('Appetizers','Loaded Fries','Fries smothered in cheese sauce and jalapenos.',499,'/images/cat-appetizers.jpg',ARRAY['Fries','Cheese sauce','Jalapeno'],4.7,true,105,'[{"name":"Extras","type":"multi","choices":[{"label":"Extra Cheese","price":90},{"label":"Add Beef","price":200}]}]'),
 ('Appetizers','Mozzarella Sticks','Crispy outside, molten inside. Served with dip.',599,'/images/cat-appetizers.jpg',ARRAY['Mozzarella','Breadcrumbs'],4.5,false,64,'[]'),
 ('Appetizers','Garlic Bread Supreme','Toasted with garlic butter and cheese.',449,'/images/cat-appetizers.jpg',ARRAY['Bread','Garlic butter','Cheese'],4.3,false,40,'[]'),
 ('Desserts','Chocolate Brownie','Warm fudge brownie with molten centre.',399,'/images/cat-desserts.jpg',ARRAY['Chocolate','Butter','Walnut'],4.8,true,90,'[{"name":"Add-ons","type":"multi","choices":[{"label":"Vanilla Scoop","price":150}]}]'),
 ('Desserts','New York Cheesecake','Classic baked cheesecake, berry compote.',549,'/images/cat-desserts.jpg',ARRAY['Cream cheese','Biscuit base','Berries'],4.6,false,55,'[]'),
 ('Drinks','Fresh Lemonade','Hand squeezed lemons with mint.',249,'/images/cat-drinks.jpg',ARRAY['Lemon','Mint','Sugar'],4.5,true,85,'[{"name":"Size","type":"single","choices":[{"label":"Regular","price":0},{"label":"Large","price":80}]}]'),
 ('Drinks','Cold Coffee','Rich espresso blended with milk and ice.',349,'/images/cat-drinks.jpg',ARRAY['Espresso','Milk','Ice'],4.6,false,66,'[]'),
 ('Drinks','Mint Margarita','Refreshing mint and lemon cooler.',299,'/images/cat-drinks.jpg',ARRAY['Mint','Lemon','Soda'],4.4,false,52,'[]')
) AS v(cat,name,description,price,image,ingredients,rating,is_featured,popularity,options)
JOIN public.categories c ON c.name = v.cat;

INSERT INTO public.reviews (menu_item_id, author_name, rating, comment)
SELECT m.id, r.author, r.rating, r.comment FROM (VALUES
 ('Classic Beef Burger','Ayesha K.',5,'Best burger in town, the sauce is unreal.'),
 ('Chicken Tikka Pizza','Bilal R.',5,'Perfectly spiced and delivered piping hot.'),
 ('Loaded Fries','Hina S.',4,'So cheesy. Could use more jalapenos!'),
 ('Chocolate Brownie','Usman A.',5,'Molten centre, absolutely worth it.')
) AS r(item,author,rating,comment) JOIN public.menu_items m ON m.name = r.item;

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER orders_touch BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
