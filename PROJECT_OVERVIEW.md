# EVS Event Portal Overview

## Project Summary

EVS Event Portal is a Next.js 16 application for publishing, managing, and analyzing Environmental Studies events. It combines a public-facing event portal with role-based staff tooling for department coordinators and super administrators.

The app is built around three connected experiences:

- Public users can browse events, open event detail pages, download event reports, view analytics, and create/sign in to accounts.
- Department admins can create and manage events for their own department, upload flyers, and export event data to Excel.
- Super admins can manage departments, create or remove admin accounts, review cross-department activity, and inspect configuration status.

## Tech Stack

- Framework: Next.js 16 App Router with React 19 and TypeScript
- Styling: Tailwind CSS 4
- Backend platform: Supabase Auth, Postgres, Storage, and RLS
- Validation: Zod
- Forms: React Hook Form
- Charts and reporting: `chart.js`, `react-chartjs-2`, `html2canvas`, `jspdf`
- Export utilities: `xlsx`

## Core Capabilities

- Public event discovery with department, type, date-range, and text filters
- Featured events and homepage metrics
- Event detail pages with printable/downloadable PDF reports
- Department-scoped admin dashboard and event management
- Event creation flow with flyer upload to Supabase Storage
- Excel export for department or global event datasets
- Super-admin dashboards for departments, admins, and platform-wide analytics
- Supabase-backed role lookup and route protection

## User Roles

### Public User

- Accesses `/`, `/events`, `/events/[id]`, `/dashboard`, `/signin`, and `/signup`
- Can browse and search events without admin access
- Can create a basic account through Supabase Auth

### Admin

- Accesses `/admin` and nested admin routes
- Manages events for a single department
- Can create events, upload flyers, and export department event records
- Is blocked from accessing departments outside their assigned scope

### Super Admin

- Accesses `/super-admin` and nested control-panel routes
- Manages departments and staff accounts across the system
- Has full visibility into all events and analytics
- Uses a dedicated super-admin login flow in the current implementation

## Main Product Flows

### 1. Public Discovery

- Homepage loads featured upcoming events plus headline stats from Supabase
- `/events` uses client-side filters and pagination through `useEvents`
- `/events/[id]` renders an event report view and supports PDF download

### 2. Department Event Operations

- Staff sign in through `/login`
- Middleware checks the Supabase session and profile role before allowing `/admin`
- Admin dashboard summarizes recent department activity
- Event creation uses `CreateEventForm`, validates with Zod, creates the event, then optionally uploads a flyer
- Event lists can be exported to Excel from the admin UI

### 3. Platform Administration

- Super-admin users enter through `/login` and the `super-admin-login` action
- `/super-admin` shows system-wide counts and department distribution
- `/super-admin/departments` manages department records
- `/super-admin/admins` creates or removes coordinators and other super admins
- `/super-admin/settings` surfaces key runtime configuration values

## Architecture At A Glance

### Frontend

- `src/app` contains App Router pages for public, admin, and super-admin areas
- `src/components` contains reusable UI, analytics widgets, layout shells, admin tools, and report components
- `src/hooks/useEvents.ts` powers event filtering and pagination
- `src/hooks/useAnalytics.ts` powers the public analytics dashboard

### Backend

- Supabase is the primary backend for auth, database access, storage, and policy enforcement
- Server-rendered pages use `src/lib/supabase/server.ts`
- Client components use `src/lib/supabase/client.ts`
- Privileged server-side actions use `src/lib/supabase/admin.ts`
- Route handlers under `src/app/api` implement event creation, upload, role lookup, and super-admin management APIs

### Access Control

- `middleware.ts` protects `/admin`, `/super-admin`, and `/login`
- Admin access is based on the authenticated Supabase user plus the `profiles.role` value
- Super-admin area currently uses an `sa_session` cookie that is compared against `SUPER_ADMIN_PASSWORD`

## Data Model

The main domain objects are:

- `departments`: academic departments that own events
- `profiles`: user records linked to Supabase Auth users, including role and optional department assignment
- `events`: the main event entity with schedule, venue, participation, visibility, and flyer metadata
- `event_registrations`: participant registrations and attendance/feedback fields
- `event_tags`: tags attached to events
- `monthly_event_stats`: analytics view grouped by month
- `department_event_stats`: analytics view grouped by department

## Important Routes

### Public Pages

- `/` home page with featured events and summary stats
- `/events` event listing and filters
- `/events/[id]` event detail and PDF report
- `/dashboard` analytics dashboard
- `/signin` public sign-in
- `/signup` public sign-up

### Staff Pages

- `/login` staff login entry point
- `/admin` department admin dashboard
- `/admin/events` event management table
- `/admin/events/create` event creation form
- `/super-admin` platform dashboard
- `/super-admin/admins` admin account management
- `/super-admin/departments` department management
- `/super-admin/events` cross-department event view
- `/super-admin/settings` runtime configuration view

### API Endpoints

- `/api/auth/role` returns the current user's role
- `/api/auth/super-admin-login` creates the super-admin session cookie
- `/api/auth/bootstrap-super-admin` promotes a designated account to super admin
- `/api/admin/events` creates and lists admin-visible events
- `/api/admin/events/[id]` deletes an event
- `/api/admin/upload` uploads a flyer and attaches it to an event
- `/api/super-admin/admins` manages admin users
- `/api/super-admin/departments` manages departments

## Environment And External Services

The codebase expects these environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPER_ADMIN_PASSWORD=
NEXT_PUBLIC_SUPER_ADMIN_EMAIL=
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=event-flyers
```

Supabase is used for:

- Auth and profile lookup
- Postgres tables, views, and row-level security
- Public media hosting for event flyers

## Database Notes

- `supabase/migrations/002_rebuild_schema.sql` appears to be the most up-to-date schema rebuild and includes the `user`, `admin`, and `super_admin` roles.
- Older migration files such as `000_complete_schema.sql` and `001_add_roles_and_profiles.sql` reflect an earlier model where new profiles defaulted to `admin`.
- The current TypeScript types align with the newer `user`-aware schema.

## File Map For New Contributors

- `src/app/page.tsx` public landing page
- `src/app/events/page.tsx` public event browser
- `src/app/events/[id]/page.tsx` event detail route
- `src/app/dashboard/page.tsx` analytics dashboard
- `src/app/admin` department admin area
- `src/app/super-admin` super-admin area
- `src/app/api` route handlers
- `src/components/admin/events` event creation, listing, upload, and export UI
- `src/components/analytics` chart and stats components
- `src/components/reports/EventReport.tsx` PDF-friendly report renderer
- `src/lib/supabase` Supabase client factories
- `supabase/migrations` schema and policy history

## Local Development

Install dependencies and start the app:

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Current Implementation Notes

- Public account pages exist alongside staff flows, so role assignment in Supabase should be verified during setup.
- Super-admin authentication currently uses a password-backed cookie flow instead of the same Supabase session pattern used for normal admins.
- Flyer uploads default to the `event-flyers` storage bucket unless `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` overrides it.

## Recommended First Reads

If you are onboarding into the codebase, start here:

1. `middleware.ts`
2. `src/app/page.tsx`
3. `src/app/admin/page.tsx`
4. `src/app/super-admin/page.tsx`
5. `supabase/migrations/002_rebuild_schema.sql`
