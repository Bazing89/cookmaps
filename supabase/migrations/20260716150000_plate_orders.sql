-- Order history for plates bought from creator posts

create table if not exists public.plate_orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references auth.users on delete cascade not null,
  post_id uuid references public.creator_posts(id) on delete cascade not null,
  plate_id uuid references public.post_plates(id) on delete set null,
  plate_label text not null,
  amount numeric not null check (amount > 0),
  status text not null default 'confirmed'
    check (status in ('confirmed', 'ready', 'picked_up', 'cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists plate_orders_buyer_id_idx on public.plate_orders (buyer_id);
create index if not exists plate_orders_created_at_idx on public.plate_orders (created_at desc);

alter table public.plate_orders enable row level security;

drop policy if exists "Buyers can view own orders" on public.plate_orders;
create policy "Buyers can view own orders"
  on public.plate_orders for select
  using (auth.uid() = buyer_id);

drop policy if exists "Buyers can create own orders" on public.plate_orders;
create policy "Buyers can create own orders"
  on public.plate_orders for insert
  with check (auth.uid() = buyer_id);
