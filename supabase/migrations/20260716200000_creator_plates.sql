-- Creator-owned plate catalog (created from profile, linked to posts when publishing)

create table if not exists public.creator_plates (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  ingredients text not null default '',
  description text not null default '',
  price numeric not null check (price > 0),
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists creator_plates_creator_id_idx
  on public.creator_plates (creator_id, created_at desc);

create or replace function public.set_creator_plates_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists creator_plates_updated_at on public.creator_plates;
create trigger creator_plates_updated_at
  before update on public.creator_plates
  for each row execute function public.set_creator_plates_updated_at();

alter table public.creator_plates enable row level security;

drop policy if exists "Creator plates are viewable by everyone" on public.creator_plates;
create policy "Creator plates are viewable by everyone"
  on public.creator_plates for select
  using (is_active = true or auth.uid() = creator_id);

drop policy if exists "Creators can insert own plates" on public.creator_plates;
create policy "Creators can insert own plates"
  on public.creator_plates for insert
  with check (auth.uid() = creator_id);

drop policy if exists "Creators can update own plates" on public.creator_plates;
create policy "Creators can update own plates"
  on public.creator_plates for update
  using (auth.uid() = creator_id);

drop policy if exists "Creators can delete own plates" on public.creator_plates;
create policy "Creators can delete own plates"
  on public.creator_plates for delete
  using (auth.uid() = creator_id);

-- Link catalog plates to posts (shorts + live)
create table if not exists public.post_plate_links (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.creator_posts(id) on delete cascade not null,
  creator_plate_id uuid references public.creator_plates(id) on delete cascade not null,
  sort_order integer not null default 0,
  unique (post_id, creator_plate_id)
);

create index if not exists post_plate_links_post_id_idx on public.post_plate_links (post_id);

alter table public.post_plate_links enable row level security;

drop policy if exists "Post plate links are viewable by everyone" on public.post_plate_links;
create policy "Post plate links are viewable by everyone"
  on public.post_plate_links for select
  using (true);

drop policy if exists "Creators can link plates to own posts" on public.post_plate_links;
create policy "Creators can link plates to own posts"
  on public.post_plate_links for insert
  with check (
    exists (
      select 1 from public.creator_posts p
      where p.id = post_id and p.creator_id = auth.uid()
    )
    and exists (
      select 1 from public.creator_plates cp
      where cp.id = creator_plate_id and cp.creator_id = auth.uid()
    )
  );

drop policy if exists "Creators can delete plate links on own posts" on public.post_plate_links;
create policy "Creators can delete plate links on own posts"
  on public.post_plate_links for delete
  using (
    exists (
      select 1 from public.creator_posts p
      where p.id = post_id and p.creator_id = auth.uid()
    )
  );
