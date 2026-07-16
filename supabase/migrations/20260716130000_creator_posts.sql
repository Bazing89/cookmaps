-- Creator profiles + posts for CookMapz

alter table public.profiles
  add column if not exists bio text,
  add column if not exists follower_count integer not null default 0;

create table if not exists public.creator_posts (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references public.profiles(id) on delete cascade not null,
  post_type text not null check (post_type in ('short', 'live')),
  title text not null,
  description text,
  cuisine text default 'Home cooking',
  bunny_video_id text,
  video_url text,
  thumbnail_url text,
  cover_image text,
  is_live boolean not null default false,
  donation_goal numeric not null default 100,
  donation_raised numeric not null default 0,
  min_donation numeric not null default 8,
  pickup_address text default '',
  pickup_neighborhood text default '',
  latitude double precision not null default 37.7749,
  longitude double precision not null default -122.4194,
  ready_in_minutes integer not null default 30,
  like_count integer not null default 0,
  viewer_count integer not null default 0,
  tags text[] not null default '{}',
  stream_key text,
  rtmp_url text,
  status text not null default 'published'
    check (status in ('draft', 'processing', 'published', 'live', 'ended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists creator_posts_creator_id_idx on public.creator_posts (creator_id);
create index if not exists creator_posts_created_at_idx on public.creator_posts (created_at desc);

create or replace function public.set_creator_posts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists creator_posts_updated_at on public.creator_posts;
create trigger creator_posts_updated_at
  before update on public.creator_posts
  for each row execute function public.set_creator_posts_updated_at();

alter table public.creator_posts enable row level security;

drop policy if exists "Posts are viewable by everyone" on public.creator_posts;
create policy "Posts are viewable by everyone"
  on public.creator_posts for select
  using (status in ('published', 'live', 'processing'));

drop policy if exists "Creators can insert own posts" on public.creator_posts;
create policy "Creators can insert own posts"
  on public.creator_posts for insert
  with check (auth.uid() = creator_id);

drop policy if exists "Creators can update own posts" on public.creator_posts;
create policy "Creators can update own posts"
  on public.creator_posts for update
  using (auth.uid() = creator_id);

drop policy if exists "Creators can delete own posts" on public.creator_posts;
create policy "Creators can delete own posts"
  on public.creator_posts for delete
  using (auth.uid() = creator_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'creator-videos',
  'creator-videos',
  true,
  524288000,
  array['video/mp4', 'video/quicktime', 'video/webm', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set public = true;

drop policy if exists "Creator videos public read" on storage.objects;
create policy "Creator videos public read"
  on storage.objects for select
  using (bucket_id = 'creator-videos');

drop policy if exists "Creators upload own videos" on storage.objects;
create policy "Creators upload own videos"
  on storage.objects for insert
  with check (
    bucket_id = 'creator-videos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Creators update own videos" on storage.objects;
create policy "Creators update own videos"
  on storage.objects for update
  using (
    bucket_id = 'creator-videos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Creators delete own videos" on storage.objects;
create policy "Creators delete own videos"
  on storage.objects for delete
  using (
    bucket_id = 'creator-videos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
