create table public.demo_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  work_email text not null,
  agency text not null,
  agency_size text,
  role_title text,
  phone text,
  message text,
  source text default 'volcop_site',
  created_at timestamptz not null default now()
);

alter table public.demo_requests enable row level security;

create policy "Anyone can submit demo request"
on public.demo_requests for insert
to anon, authenticated
with check (true);

create policy "Admins can view demo requests"
on public.demo_requests for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create index demo_requests_created_at_idx on public.demo_requests (created_at desc);