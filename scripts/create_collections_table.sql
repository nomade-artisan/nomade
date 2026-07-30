-- Supabase SQL: add collections and link categories to a parent collection

create table if not exists public.collections (
  id bigserial primary key,
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);

alter table if exists public.categories
  add column if not exists collection_id bigint references public.collections(id) on delete restrict;

create index if not exists categories_collection_id_idx on public.categories (collection_id);

insert into public.collections (name, slug, description)
values
  ('Sacs', 'sacs', 'Sacs et pieces de maroquinerie du quotidien'),
  ('Accessoires', 'accessoires', 'Petits accessoires et complements'),
  ('Autres', 'autres', 'Autres produits et editions speciales')
on conflict (slug) do nothing;

update public.categories
set collection_id = collections.id
from public.collections
where public.categories.collection_id is null
  and collections.slug = case
    when public.categories.slug in ('accessoires', 'portefeuilles', 'montres', 'trousses') then 'accessoires'
    when public.categories.slug in ('autres', 'divers') then 'autres'
    else 'sacs'
  end;

alter table public.categories
  alter column collection_id set not null;
