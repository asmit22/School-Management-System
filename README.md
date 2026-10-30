# School Management System

An admin-only system for tracking teacher attendance, student records, and
fee collection across academic sessions (April → March).

## Stack

- React 19 + Vite
- Tailwind CSS
- Supabase (Postgres, Auth, Row Level Security)
- React Router

## How access control works

There is no public sign-up screen. Every table is protected by Postgres
Row Level Security scoped to a `public.admins` table — a user can only read
or write data once their `auth.users` row also has a matching row in
`admins`. Non-admin accounts, and anonymous requests, get nothing back at
the database level (not just hidden in the UI), because RLS denies any
action a table has no policy for.

New admins are added directly in Supabase, not through the app. This is
deliberate: it keeps a bug or a compromised session in the client code from
being able to grant itself (or anyone else) admin access.

## Setup

### 1. Create a Supabase project

Create a project at [supabase.com](https://supabase.com) if you don't
already have one.

### 2. Run the schema

Open **SQL Editor** in your Supabase project, paste the contents of
[`supabase/schema.sql`](./supabase/schema.sql), and run it. This creates
every table, the `is_admin()` helper function, RLS policies, and seeds one
active session for the current academic year. It's safe to re-run.

### 3. Create your first admin

The app has no registration page, so the first admin has to be created by
hand:

1. In Supabase, go to **Authentication → Users → Add user**, and create a
   user with an email and password (tick "Auto Confirm User" so it doesn't
   need an email confirmation link).
2. Copy that user's UID.
3. Back in **SQL Editor**, run:
   ```sql
   insert into public.admins (id, email, full_name)
   values ('paste-the-uid-here', 'admin@yourschool.example', 'Admin Name');
   ```
4. Repeat steps 1–3 for any other admins.

### 4. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your project's URL and
anon/public key, both found under **Project Settings → API**:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 5. Install and run

```
npm install
npm run dev
```

Sign in at `/login` with the admin account you created in step 3.

## How fee tracking works

A **session** is one academic year, e.g. `2026-2027` running April 2026 →
March 2027. A **fee record** is one row per student, per session, per
month (`month` is 1–12, where 1 = April and 12 = March). A month has no fee
record until an admin opens that cell on the Fees page and sets a due
amount — until then it just displays as pending with no amount. Setting the
due amount and logging a payment happen together in the same form, so
there's no separate "fee structure" step to configure first.

`status` (paid / partial / pending) is a generated column driven off
`amount_due` and `amount_paid` — it's derived by Postgres itself, so it
can never drift out of sync with the amounts on a row.

## Project structure

```
supabase/schema.sql   Database schema, RLS policies, is_admin() function
src/config            Supabase client
src/context           AuthContext (session + admin verification)
src/hooks             useAuth, useStudents, useTeachers, useFees
src/components        UI grouped by feature (common/students/teachers/attendance/fees)
src/pages             One file per route
src/utils             Session-months constant, fee math, date formatting
```

Attendance marking has no dedicated hook — `AttendancePage.jsx` talks to
Supabase directly, since it's the only place that needs that data. Session
management (the dropdown + "New session" on the Fees page) works the same
way, rather than adding pages/hooks that only that one feature would use.
