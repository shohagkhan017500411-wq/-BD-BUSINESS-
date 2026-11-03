-- BD BUSINESS: admin approval setup for Supabase
-- Review this script with an adult project owner before running it.
-- Run in the SQL Editor of the correct Supabase project.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_bd_business_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

revoke all on function public.is_bd_business_admin() from public;
grant execute on function public.is_bd_business_admin() to anon, authenticated;

create table if not exists public.seller_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  shop_name text not null,
  contact_name text,
  phone text,
  description text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.market_products (
  id uuid primary key default gen_random_uuid(),
  seller_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  category text,
  price numeric(12,2) not null check (price >= 0),
  image_url text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
alter table public.seller_applications enable row level security;
alter table public.market_products enable row level security;

-- Admin membership must be managed only by the project owner in SQL Editor.
drop policy if exists "Admins can read admin users" on public.admin_users;
create policy "Admins can read admin users"
on public.admin_users for select to authenticated
using (public.is_bd_business_admin());

drop policy if exists "Users can submit own seller application" on public.seller_applications;
create policy "Users can submit own seller application"
on public.seller_applications for insert to authenticated
with check (auth.uid() = user_id and status = 'pending');

drop policy if exists "Users can read own seller application" on public.seller_applications;
create policy "Users can read own seller application"
on public.seller_applications for select to authenticated
using (auth.uid() = user_id or public.is_bd_business_admin());

drop policy if exists "Admins can update seller applications" on public.seller_applications;
create policy "Admins can update seller applications"
on public.seller_applications for update to authenticated
using (public.is_bd_business_admin())
with check (public.is_bd_business_admin());

drop policy if exists "Public can read approved products" on public.market_products;
create policy "Public can read approved products"
on public.market_products for select to anon, authenticated
using (
  status = 'approved'
  or public.is_bd_business_admin()
  or auth.uid() = seller_user_id
);

drop policy if exists "Approved sellers can submit pending products" on public.market_products;
create policy "Approved sellers can submit pending products"
on public.market_products for insert to authenticated
with check (
  auth.uid() = seller_user_id
  and status = 'pending'
  and exists (
    select 1 from public.seller_applications sa
    where sa.user_id = auth.uid() and sa.status = 'approved'
  )
);

drop policy if exists "Admins can update products" on public.market_products;
create policy "Admins can update products"
on public.market_products for update to authenticated
using (public.is_bd_business_admin())
with check (public.is_bd_business_admin());

-- After creating the chosen admin account in Authentication > Users,
-- copy its UUID into the INSERT below and run that INSERT separately.
-- Do not share passwords, OTPs, or secret keys.
--
-- insert into public.admin_users (user_id)
-- values ('PASTE-ADMIN-AUTH-USER-UUID-HERE');
