-- Run these SQL commands in Supabase SQL editor to create required tables.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  age int,
  sex text,
  height int,
  weight int,
  activity_level text,
  goals text,
  preferences jsonb,
  pantry text[],
  budget numeric,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists recipes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete set null,
  name text not null,
  calories int,
  protein int,
  carbs int,
  fats int,
  servings int,
  ingredients jsonb,
  instructions jsonb,
  created_at timestamp with time zone default now()
);
