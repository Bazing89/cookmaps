-- Plate photos for creator posts

alter table public.post_plates
  add column if not exists image_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'plate-images',
  'plate-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do nothing;

drop policy if exists "Plate images are publicly accessible" on storage.objects;
create policy "Plate images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'plate-images');

drop policy if exists "Creators can upload plate images" on storage.objects;
create policy "Creators can upload plate images"
  on storage.objects for insert
  with check (
    bucket_id = 'plate-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Creators can update own plate images" on storage.objects;
create policy "Creators can update own plate images"
  on storage.objects for update
  using (
    bucket_id = 'plate-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Creators can delete own plate images" on storage.objects;
create policy "Creators can delete own plate images"
  on storage.objects for delete
  using (
    bucket_id = 'plate-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
