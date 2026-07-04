create table if not exists public.product_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile text not null,
  target_audience_description text not null,
  selected_audience text not null,
  selected_pain text not null,
  selected_transformation text not null,
  experience_level text not null,
  selected_format text not null,
  generated_result jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists product_results_user_created_at_idx
  on public.product_results (user_id, created_at desc);

alter table public.product_results enable row level security;

drop policy if exists "Users can read own product results" on public.product_results;
create policy "Users can read own product results"
  on public.product_results
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own product results" on public.product_results;
create policy "Users can insert own product results"
  on public.product_results
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);
