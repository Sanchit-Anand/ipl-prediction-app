-- Extensions
create extension if not exists "pgcrypto";

-- Profiles
create table if not exists public.users_profile (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role text not null default 'user' check (role in ('user','admin')),
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Matches
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  external_match_id text unique,
  season text,
  team1 text not null,
  team2 text not null,
  team1_short text,
  team2_short text,
  match_time timestamptz not null,
  venue text,
  status text not null default 'upcoming'
    check (status in ('upcoming','live','completed','abandoned','no_result')),
  lock_time timestamptz not null,
  winner_team text,
  result_type text default 'normal'
    check (result_type in ('normal','abandoned','no_result','tie')),
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Predictions
create table if not exists public.predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  match_id uuid not null references public.matches(id) on delete cascade,
  selected_team text not null,
  predicted_at timestamptz not null default now(),
  updated_at timestamptz,
  points_awarded integer not null default 0,
  prediction_status text not null default 'pending'
    check (prediction_status in ('pending','correct','wrong','cancelled','no_result')),
  unique (user_id, match_id)
);

-- Messages (chat)
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  receiver_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists messages_sender_id_idx on public.messages(sender_id);
create index if not exists messages_receiver_id_idx on public.messages(receiver_id);
create index if not exists messages_created_at_idx on public.messages(created_at);

-- Notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text,
  type text not null default 'system',
  meta jsonb,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists notifications_user_id_idx on public.notifications(user_id);
create index if not exists notifications_created_at_idx on public.notifications(created_at);

create index if not exists predictions_user_id_idx on public.predictions(user_id);
create index if not exists predictions_match_id_idx on public.predictions(match_id);
create index if not exists matches_status_idx on public.matches(status);
create index if not exists matches_lock_time_idx on public.matches(lock_time);

-- Updated at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_matches_updated_at on public.matches;
create trigger set_matches_updated_at
before update on public.matches
for each row execute procedure public.set_updated_at();

drop trigger if exists set_predictions_updated_at on public.predictions;
create trigger set_predictions_updated_at
before update on public.predictions
for each row execute procedure public.set_updated_at();

-- Auto profile creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users_profile (id, full_name, email, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email, 'user')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Admin helper
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists(
    select 1 from public.users_profile
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Prediction lock helper
create or replace function public.can_predict(p_match_id uuid)
returns boolean
language sql
stable
as $$
  select exists(
    select 1 from public.matches
    where id = p_match_id
      and now() < lock_time
      and status in ('upcoming','live')
      and (timezone('Asia/Kolkata', now()))::date =
          (timezone('Asia/Kolkata', match_time))::date
  );
$$;

-- Set match result + update points
create or replace function public.set_match_result(
  p_match_id uuid,
  p_winner_team text,
  p_result_type text
)
returns void
language plpgsql
security definer
as $$
begin
  update public.matches
  set winner_team = p_winner_team,
      status = case
        when p_result_type in ('abandoned','no_result') then p_result_type
        else 'completed'
      end,
      result_type = p_result_type,
      updated_at = now()
  where id = p_match_id;

  update public.predictions
  set prediction_status = case
        when p_result_type in ('abandoned','no_result','tie') then 'no_result'
        when selected_team = p_winner_team then 'correct'
        else 'wrong'
      end,
      points_awarded = case
        when p_result_type = 'normal' and selected_team = p_winner_team then 1
        else 0
      end,
      updated_at = now()
  where match_id = p_match_id;
end;
$$;

-- Leaderboard view with tie-breakers
create or replace view public.leaderboard_view
with (security_invoker = false)
as
select
  up.id as user_id,
  up.full_name,
  up.email,
  coalesce(sum(p.points_awarded),0) as total_points,
  coalesce(count(p.id),0) as total_predictions,
  coalesce(sum(case when p.prediction_status = 'correct' then 1 else 0 end),0)
    as correct_predictions,
  case
    when coalesce(count(p.id),0) = 0 then 0
    else round((sum(case when p.prediction_status = 'correct' then 1 else 0 end)::decimal
      / count(p.id)) * 100, 1)
  end as win_rate,
  coalesce(
    min(case when p.prediction_status = 'correct' then p.predicted_at end),
    min(p.predicted_at)
  ) as tie_breaker,
  up.created_at as user_created_at,
  row_number() over (
    order by
      coalesce(sum(p.points_awarded),0) desc,
      coalesce(
        min(case when p.prediction_status = 'correct' then p.predicted_at end),
        min(p.predicted_at)
      ) asc nulls last,
      up.created_at asc
  ) as rank
from public.users_profile up
left join public.predictions p on p.user_id = up.id
group by up.id, up.full_name, up.email, up.created_at;

-- RLS
alter table public.users_profile enable row level security;
alter table public.matches enable row level security;
alter table public.predictions enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "Users can read own profile" on public.users_profile;
create policy "Users can read own profile"
on public.users_profile
for select
using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.users_profile;
create policy "Users can update own profile"
on public.users_profile
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.users_profile;
create policy "Users can insert own profile"
on public.users_profile
for insert
with check (auth.uid() = id);

drop policy if exists "Admins manage profiles" on public.users_profile;
create policy "Admins manage profiles"
on public.users_profile
for all
using (public.is_admin());

drop policy if exists "Authenticated can read matches" on public.matches;
create policy "Authenticated can read matches"
on public.matches
for select
using (auth.role() = 'authenticated');

drop policy if exists "Admins manage matches" on public.matches;
create policy "Admins manage matches"
on public.matches
for all
using (public.is_admin());

drop policy if exists "Users can read own predictions" on public.predictions;
create policy "Users can read own predictions"
on public.predictions
for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can insert predictions before lock" on public.predictions;
create policy "Users can insert predictions before lock"
on public.predictions
for insert
with check (auth.uid() = user_id and public.can_predict(match_id));

drop policy if exists "Admins manage predictions" on public.predictions;
create policy "Admins manage predictions"
on public.predictions
for all
using (public.is_admin());

drop policy if exists "Users can read own messages" on public.messages;
create policy "Users can read own messages"
on public.messages
for select
using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "Users can send messages" on public.messages;
create policy "Users can send messages"
on public.messages
for insert
with check (auth.uid() = sender_id);

drop policy if exists "Receivers can mark read" on public.messages;
create policy "Receivers can mark read"
on public.messages
for update
using (auth.uid() = receiver_id);

drop policy if exists "Users can read own notifications" on public.notifications;
create policy "Users can read own notifications"
on public.notifications
for select
using (auth.uid() = user_id);

drop policy if exists "Users can update own notifications" on public.notifications;
create policy "Users can update own notifications"
on public.notifications
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

grant select on public.leaderboard_view to authenticated;

-- Public profiles view (safe to show)
create or replace view public.public_profiles
as
select id, full_name, avatar_url, created_at
from public.users_profile;

grant select on public.public_profiles to authenticated;

-- Notification helpers
create or replace function public.create_notification(
  p_user_id uuid,
  p_title text,
  p_body text,
  p_type text,
  p_meta jsonb
)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.notifications(user_id, title, body, type, meta)
  values (p_user_id, p_title, p_body, p_type, p_meta);
end;
$$;

create or replace function public.notify_prediction_result()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.prediction_status is distinct from old.prediction_status then
    perform public.create_notification(
      new.user_id,
      'Prediction Updated',
      'Your prediction was marked ' || new.prediction_status,
      'prediction',
      jsonb_build_object('match_id', new.match_id)
    );
  end if;
  return new;
end;
$$;

drop trigger if exists notify_prediction_result on public.predictions;
create trigger notify_prediction_result
after update on public.predictions
for each row execute procedure public.notify_prediction_result();

create or replace function public.notify_new_message()
returns trigger
language plpgsql
security definer
as $$
declare
  sender_name text;
begin
  select coalesce(full_name, email) into sender_name
  from public.users_profile
  where id = new.sender_id;

  perform public.create_notification(
    new.receiver_id,
    'New Message',
    'Message from ' || coalesce(sender_name, 'a user'),
    'message',
    jsonb_build_object('sender_id', new.sender_id)
  );
  return new;
end;
$$;

drop trigger if exists notify_new_message on public.messages;
create trigger notify_new_message
after insert on public.messages
for each row execute procedure public.notify_new_message();
