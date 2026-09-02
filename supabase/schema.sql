-- ==============================================================================
-- SUPABASE POSTGRESQL SCHEMA — BENGALI E-COMMERCE LANDING & ORDER SYSTEM
-- ==============================================================================
-- Zero Demo Data — Clean Production Schema with Row Level Security (RLS)
-- ==============================================================================

-- 1. Enable Required Extensions
create extension if not exists "uuid-ossp";

-- 2. User Profiles Table (Linked to Supabase Auth auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role text not null default 'admin' check (role in ('superadmin', 'admin')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 3. Products Table
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  main_image text not null,
  images text[] default '{}',
  description text default '',
  details text[] default '{}',
  price numeric(12, 2) not null check (price >= 0),
  old_price numeric(12, 2) check (old_price is null or old_price >= 0),
  discount_percent integer default 0,
  sizes text[] default '{}',
  colors text[] default '{}',
  stock integer not null default 0 check (stock >= 0),
  is_active boolean default true,
  is_featured boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 4. Customers Table (Auto-aggregated from orders)
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null unique,
  address text default '',
  district text default '',
  division text default '',
  total_orders integer default 1,
  total_spent numeric(12, 2) default 0,
  last_order_date timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 5. Orders Table
create table if not exists public.orders (
  id text primary key,
  customer_name text not null,
  phone text not null,
  division text default '',
  district text default '',
  upazila text default '',
  address text not null,
  delivery_location text not null check (delivery_location in ('inside_dhaka', 'outside_dhaka')),
  delivery_charge numeric(12, 2) not null default 60,
  items_subtotal numeric(12, 2) not null default 0,
  discount_total numeric(12, 2) not null default 0,
  total_amount numeric(12, 2) not null default 0,
  payment_method text not null default 'cod' check (payment_method in ('cod', 'bkash', 'nagad')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid')),
  transaction_id text,
  order_status text not null default 'pending' check (order_status in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 6. Order Items Table (Snapshot of product details at time of order)
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders(id) on delete cascade,
  product_id text not null,
  product_name text not null,
  product_image text default '',
  price numeric(12, 2) not null,
  quantity integer not null check (quantity > 0),
  size text default '',
  color text default '',
  subtotal numeric(12, 2) not null,
  created_at timestamp with time zone default now()
);

-- 7. Site Settings Table (Single Row)
create table if not exists public.settings (
  id text primary key default 'primary_settings',
  shop_name text not null default 'পছন্দের শপ',
  tagline text default 'প্রিমিয়াম কোয়ালিটি ও বিশ্বস্ত ডেলিভারি',
  logo_url text default '',
  phone text default '01700-000000',
  email text default 'info@pochendershop.com',
  facebook_page_url text default '',
  inside_dhaka_delivery_charge numeric(12, 2) not null default 60,
  outside_dhaka_delivery_charge numeric(12, 2) not null default 135,
  cod_enabled boolean default true,
  bkash_enabled boolean default true,
  nagad_enabled boolean default true,
  bkash_number text default '',
  nagad_number text default '',
  hero_title text default 'সেরা কালেকশনের প্রিমিয়াম পণ্য কিনুন ঘরে বসেই',
  hero_subtitle text default '১০০% অরিজিনাল কোয়ালিটি, সারাদেশে দ্রুত ক্যাশ অন ডেলিভারি ও সহজে রিটার্ন সুবিধা',
  hero_image text default '',
  notice_text text default 'সারাদেশে দ্রুত ক্যাশ অন ডেলিভারি সুবিধা! প্রোডাক্ট দেখে মূল্য পরিশোধ করুন।',
  updated_at timestamp with time zone default now()
);

-- Seed default empty settings row only if table is empty
insert into public.settings (id, shop_name)
values ('primary_settings', 'পছন্দের শপ')
on conflict (id) do nothing;

-- 8. Storage Bucket for Product Images
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==============================================================================
create index if not exists idx_products_active on public.products(is_active);
create index if not exists idx_products_featured on public.products(is_featured);
create index if not exists idx_orders_created on public.orders(created_at desc);
create index if not exists idx_orders_phone on public.orders(phone);
create index if not exists idx_orders_status on public.orders(order_status);
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_customers_phone on public.customers(phone);

-- ==============================================================================
-- HELPER FUNCTIONS & TRIGGERS
-- ==============================================================================

-- Function to check if executing user is an authenticated Admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role in ('superadmin', 'admin')
  );
end;
$$ language plpgsql security definer;

-- Trigger to auto-create public.profiles entry when new user signs up in auth.users
create or replace function public.handle_new_admin_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Admin User'),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'admin')
  )
  on conflict (id) do update
  set email = excluded.email,
      name = coalesce(excluded.name, profiles.name);
  return new;
end;
$$ language plpgsql security definer;

-- Bind trigger to auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_admin_user();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.settings enable row level security;

-- PROFILES POLICIES
create policy "Admins can view profiles"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- PRODUCTS POLICIES
create policy "Public can view active products"
  on public.products for select
  to anon, authenticated
  using (is_active = true or public.is_admin());

create policy "Admins can insert products"
  on public.products for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update products"
  on public.products for update
  to authenticated
  using (public.is_admin());

create policy "Admins can delete products"
  on public.products for delete
  to authenticated
  using (public.is_admin());

-- SETTINGS POLICIES
create policy "Public can view settings"
  on public.settings for select
  to anon, authenticated
  using (true);

create policy "Admins can update settings"
  on public.settings for update
  to authenticated
  using (public.is_admin());

-- ORDERS POLICIES
create policy "Public can create orders"
  on public.orders for insert
  to anon, authenticated
  with check (true);

create policy "Admins can view all orders"
  on public.orders for select
  to authenticated
  using (public.is_admin());

create policy "Admins can update orders"
  on public.orders for update
  to authenticated
  using (public.is_admin());

create policy "Admins can delete orders"
  on public.orders for delete
  to authenticated
  using (public.is_admin());

-- ORDER ITEMS POLICIES
create policy "Public can insert order items"
  on public.order_items for insert
  to anon, authenticated
  with check (true);

create policy "Admins can view order items"
  on public.order_items for select
  to authenticated
  using (public.is_admin());

-- CUSTOMERS POLICIES
create policy "Admins can manage customers"
  on public.customers for all
  to authenticated
  using (public.is_admin());

-- STORAGE POLICIES (product-images bucket)
create policy "Public can read product images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');

create policy "Admins can upload product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images');

create policy "Admins can update product images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images');

create policy "Admins can delete product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images');
