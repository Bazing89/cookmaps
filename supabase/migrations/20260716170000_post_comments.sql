-- Questions / comments on creator posts

create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.creator_posts(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  body text not null check (char_length(trim(body)) between 1 and 500),
  created_at timestamptz not null default now()
);

create index if not exists post_comments_post_id_idx on public.post_comments (post_id, created_at asc);
create index if not exists post_comments_author_id_idx on public.post_comments (author_id);

alter table public.post_comments enable row level security;

drop policy if exists "Comments are viewable by everyone" on public.post_comments;
create policy "Comments are viewable by everyone"
  on public.post_comments for select
  using (true);

drop policy if exists "Authenticated users can comment" on public.post_comments;
create policy "Authenticated users can comment"
  on public.post_comments for insert
  with check (auth.uid() = author_id);

drop policy if exists "Authors and creators can delete comments" on public.post_comments;
create policy "Authors and creators can delete comments"
  on public.post_comments for delete
  using (
    auth.uid() = author_id
    or exists (
      select 1 from public.creator_posts
      where id = post_id and creator_id = auth.uid()
    )
  );
