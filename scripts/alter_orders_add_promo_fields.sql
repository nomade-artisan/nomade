-- Supabase SQL: persist promo traces on orders

alter table if exists public.orders
  add column if not exists promo_code text,
  add column if not exists discount_amount numeric(10,2) not null default 0;

create index if not exists orders_promo_code_idx on public.orders (promo_code);
