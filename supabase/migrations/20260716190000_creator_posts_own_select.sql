-- Creators must be able to read all of their own posts (including ended/draft) for profile + delete.

drop policy if exists "Creators can view own posts" on public.creator_posts;
create policy "Creators can view own posts"
  on public.creator_posts for select
  using (auth.uid() = creator_id);
