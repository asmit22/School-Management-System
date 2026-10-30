-- ============================================================================
-- School Management System — Database Schema
-- ============================================================================
-- Run this once in your Supabase project's SQL Editor (Project → SQL Editor →
-- New query → paste all of this → Run). Safe to re-run: every statement is
-- guarded with IF NOT EXISTS / OR REPLACE / ON CONFLICT where possible.
--
-- After running this file, see README.md → "Create your first admin" — the
-- app has no public sign-up screen, so an admin has to be seeded manually.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- ADMINS
-- One row per person allowed to use the app. `id` is the same uuid as the
-- matching row in Supabase's built-in auth.users — there is no separate
-- password/email management here, Supabase Auth handles that.
-- ----------------------------------------------------------------------------
create table if not exists public.admins (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- is_admin() — the single source of truth every RLS policy below checks.
--
-- SECURITY DEFINER makes this function run as the role that OWNS it (the
-- `postgres` role, when created from the SQL Editor), which has BYPASSRLS.
-- That means the "select 1 from public.admins" query inside it skips RLS
-- entirely instead of re-triggering the policy on public.admins — which is
-- what causes "infinite recursion detected in policy" errors if a policy
-- queries its own table directly instead of going through a function like
-- this. Every policy in this file calls is_admin() rather than querying
-- public.admins inline, specifically to avoid that.
-- ----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admins where id = auth.uid()
  );
$$;

grant execute on function public.is_admin() to authenticated;

-- ----------------------------------------------------------------------------
-- updated_at helper trigger
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- SESSIONS
-- One row per academic session/year, e.g. "2026-2027" running Apr 2026 →
-- Mar 2027. Fee records and (optionally) attendance reporting are scoped to
-- a session. Only one session should be is_active at a time — the app uses
-- that flag to pick the default session to show.
-- ----------------------------------------------------------------------------
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  start_date date not null,
  end_date date not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  constraint sessions_date_order check (end_date > start_date)
);

-- ----------------------------------------------------------------------------
-- STUDENTS
-- ----------------------------------------------------------------------------
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  admission_number text not null unique,
  full_name text not null,
  class text not null,
  section text,
  gender text check (gender in ('Male', 'Female', 'Other')),
  date_of_birth date,
  parent_name text,
  parent_phone text,
  address text,
  admission_date date not null default current_date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_students_updated_at on public.students;
create trigger set_students_updated_at
  before update on public.students
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- TEACHERS
-- ----------------------------------------------------------------------------
create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  employee_code text not null unique,
  full_name text not null,
  email text,
  phone text,
  subject text,
  qualification text,
  joining_date date not null default current_date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_teachers_updated_at on public.teachers;
create trigger set_teachers_updated_at
  before update on public.teachers
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- TEACHER ATTENDANCE
-- One row per teacher per calendar date.
-- ----------------------------------------------------------------------------
create table if not exists public.teacher_attendance (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  date date not null,
  status text not null check (status in ('present', 'absent', 'half_day', 'leave')),
  remarks text,
  marked_by uuid references public.admins(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (teacher_id, date)
);

-- ----------------------------------------------------------------------------
-- FEE RECORDS
-- One row per student, per session, per month. `month` is 1–12 mapped to the
-- April→March session year (1 = April … 12 = March), matching the
-- SESSION_MONTHS array in src/utils/constants.js. `status` is derived, not
-- entered directly, so it can never drift out of sync with the amounts.
-- ----------------------------------------------------------------------------
create table if not exists public.fee_records (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  session_id uuid not null references public.sessions(id) on delete cascade,
  month smallint not null check (month between 1 and 12),
  amount_due numeric(10, 2) not null default 0,
  amount_paid numeric(10, 2) not null default 0,
  payment_date date,
  payment_mode text check (payment_mode in ('cash', 'online', 'upi', 'cheque', 'bank_transfer')),
  remarks text,
  updated_by uuid references public.admins(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text generated always as (
    case
      when amount_paid <= 0 then 'pending'
      when amount_paid >= amount_due and amount_due > 0 then 'paid'
      else 'partial'
    end
  ) stored,
  unique (student_id, session_id, month)
);

drop trigger if exists set_fee_records_updated_at on public.fee_records;
create trigger set_fee_records_updated_at
  before update on public.fee_records
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Indexes
-- ----------------------------------------------------------------------------
create index if not exists idx_students_class_section on public.students(class, section);
create index if not exists idx_teacher_attendance_date on public.teacher_attendance(date);
create index if not exists idx_teacher_attendance_teacher on public.teacher_attendance(teacher_id);
create index if not exists idx_fee_records_session on public.fee_records(session_id);
create index if not exists idx_fee_records_student on public.fee_records(student_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- Every table is admin-only: authenticated users who are NOT in public.admins
-- (and fully anonymous requests) are denied by default, because RLS denies
-- any action with no matching policy. There is no separate "read-only" tier
-- in this app — every admin can read and write everything.
-- ============================================================================

alter table public.admins enable row level security;
alter table public.sessions enable row level security;
alter table public.students enable row level security;
alter table public.teachers enable row level security;
alter table public.teacher_attendance enable row level security;
alter table public.fee_records enable row level security;

-- admins: readable by admins (so the app can show "signed in as ___"), but
-- deliberately has NO insert/update/delete policy. RLS denies whatever a
-- table has no policy for, so new admins can only be added from the SQL
-- Editor / Supabase dashboard, never from the client app. This keeps a
-- compromised or buggy client session from being able to grant itself (or
-- anyone else) admin access.
drop policy if exists "Admins can view admin list" on public.admins;
create policy "Admins can view admin list"
  on public.admins for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins full access to sessions" on public.sessions;
create policy "Admins full access to sessions"
  on public.sessions for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins full access to students" on public.students;
create policy "Admins full access to students"
  on public.students for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins full access to teachers" on public.teachers;
create policy "Admins full access to teachers"
  on public.teachers for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins full access to teacher_attendance" on public.teacher_attendance;
create policy "Admins full access to teacher_attendance"
  on public.teacher_attendance for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins full access to fee_records" on public.fee_records;
create policy "Admins full access to fee_records"
  on public.fee_records for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- Seed the current session so Fees / Dashboard have something to show on
-- first run. Adjust the year or add more sessions any time — see README.md.
-- ----------------------------------------------------------------------------
insert into public.sessions (name, start_date, end_date, is_active)
values ('2026-2027', '2026-04-01', '2027-03-31', true)
on conflict (name) do nothing;
