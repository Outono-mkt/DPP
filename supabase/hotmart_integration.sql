create table if not exists public.customer_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  buyer_name text null,
  provider text not null default 'hotmart',
  product_id text not null,
  offer_code text null,
  transaction_id text not null unique,
  access_status text not null default 'active',
  must_change_password boolean not null default true,
  purchased_at timestamptz null,
  revoked_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customer_access_status_check
    check (access_status in ('active', 'refunded', 'chargeback', 'canceled', 'blocked'))
);

create index if not exists customer_access_user_id_idx on public.customer_access(user_id);
create index if not exists customer_access_email_idx on public.customer_access(email);
create index if not exists customer_access_transaction_id_idx on public.customer_access(transaction_id);
create index if not exists customer_access_product_id_idx on public.customer_access(product_id);
create index if not exists customer_access_access_status_idx on public.customer_access(access_status);

alter table public.customer_access enable row level security;

drop policy if exists "Users can read own customer access" on public.customer_access;
create policy "Users can read own customer access"
on public.customer_access
for select
to authenticated
using (auth.uid() = user_id);
