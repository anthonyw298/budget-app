-- Run this in your Supabase SQL editor

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  amount numeric(10,2) not null,
  category text not null,
  date date not null,
  note text default '',
  receipt_url text,
  is_recurring_instance boolean default false,
  created_at timestamptz default now()
);

create table if not exists budgets (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  month int not null,
  year int not null,
  allocated numeric(10,2) not null default 0,
  rollover numeric(10,2) not null default 0,
  unique(category, month, year)
);

create table if not exists recurring (
  id uuid primary key default gen_random_uuid(),
  amount numeric(10,2) not null,
  category text not null,
  note text default '',
  frequency text not null check (frequency in ('weekly','monthly')),
  next_due date not null,
  active boolean default true,
  created_at timestamptz default now()
);

-- Enable row level security (public read/write since no auth)
alter table transactions enable row level security;
alter table budgets enable row level security;
alter table recurring enable row level security;

create policy "public access transactions" on transactions for all using (true) with check (true);
create policy "public access budgets" on budgets for all using (true) with check (true);
create policy "public access recurring" on recurring for all using (true) with check (true);
