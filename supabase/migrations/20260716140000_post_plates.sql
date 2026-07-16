-- Plates for sale on creator posts (shorts + live)

create table if not exists public.post_plates (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.creator_posts(id) on delete cascade not null,
  label text not null,
  description text default '',
  price numeric not null check (price > 0),
  quantity integer,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists post_plates_post_id_idx on public.post_plates (post_id);

alter table public.post_plates enable row level security;

drop policy if exists "Plates are viewable by everyone" on public.post_plates;
create policy "Plates are viewable by everyone"
  on public.post_plates for select
  using (true);

drop policy if exists "Creators can insert plates on own posts" on public.post_plates;
create policy "Creators can insert plates on own posts"
  on public.post_plates for insert
  with check (
    exists (
      select 1 from public.creator_posts p
      where p.id = post_id and p.creator_id = auth.uid()
    )
  );

drop policy if exists "Creators can update plates on own posts" on public.post_plates;
create policy "Creators can update plates on own posts"
  on public.post_plates for update
  using (
    exists (
      select 1 from public.creator_posts p
      where p.id = post_id and p.creator_id = auth.uid()
    )
  );

drop policy if exists "Creators can delete plates on own posts" on public.post_plates;
create policy "Creators can delete plates on own posts"
  on public.post_plates for delete
  using (
    exists (
      select 1 from public.creator_posts p
      where p.id = post_id and p.creator_id = auth.uid()
    )
  );
