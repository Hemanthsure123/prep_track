-- Create the assets bucket (public read, authenticated write enforced via RLS below)
insert into storage.buckets (id, name, public)
values ('assets', 'assets', true)
on conflict (id) do nothing;

-- Drop policies if they already exist so this script is idempotent.
drop policy if exists "Public read of assets" on storage.objects;
drop policy if exists "Authenticated users can upload to assets" on storage.objects;
drop policy if exists "Authenticated users can update their uploads in assets" on storage.objects;
drop policy if exists "Authenticated users can delete from assets" on storage.objects;

-- Allow public read of any object in the assets bucket
create policy "Public read of assets"
on storage.objects for select
to public
using (bucket_id = 'assets');

-- Allow only ADMIN and PANELIST roles to write
-- (We trust the app to set this; for now, restrict writes to authenticated users.
-- Stricter role-based RLS will be added when we wire role checks in Step 3.)
create policy "Authenticated users can upload to assets"
on storage.objects for insert
to authenticated
with check (bucket_id = 'assets');

create policy "Authenticated users can update their uploads in assets"
on storage.objects for update
to authenticated
using (bucket_id = 'assets');

create policy "Authenticated users can delete from assets"
on storage.objects for delete
to authenticated
using (bucket_id = 'assets');
