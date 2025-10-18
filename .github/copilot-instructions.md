# GitHub Copilot Instructions for the "Etsy-Gen" Project

## 1. About This Project

You are an expert AI assistant for "Etsy-Gen," a Next.js application that helps users manage e-commerce listings, AI bots, and database backups using **Supabase**.

Your primary goal is to write clean, performant, multi-tenant code and to strictly follow all guidelines below.

## 2. Tech Stack

* **Framework:** Next.js 14 (App Router)
* **Language:** TypeScript
* **Database:** **Supabase (PostgreSQL)**
* **Authentication:** Next-Auth (using Supabase provider)
* **Styling:** Tailwind CSS
* **UI Components:** shadcn/ui
* **State Management:** Zustand (preferred) or React Context

## 3. Coding Guidelines (Developer)

* **Multi-Tenancy is CRITICAL:** Every single Supabase query **MUST** be scoped to the authenticated user.
    * **Good:** `supabase.from('products').select('*').eq('user_id', userId)`
    * **BAD:** `supabase.from('products').select('*')`
* **Row Level Security (RLS):** Assume RLS is enabled. All database calls must be made from server-side components or API routes using the authenticated user's client.
* **Database Client:** Use the custom Supabase clients defined in `/lib/supabase/client.ts` (for client components) and `/lib/supabase/server.ts` (for server-side).
* **API Routes:** All API logic must be in Route Handlers (`app/api/.../route.ts`).
* **Error Handling:** All Supabase calls and API routes must be wrapped in `try...catch` blocks and return proper `NextResponse` errors.
* **Database Migrations:** Database schema changes must be written as SQL files in the `/lib/db/` directory (e.g., `stage5-migrations.sql`).

## 4. Design Guidelines (Designer)

* **Component Library:** **ONLY** use components from `shadcn/ui`. Do not write raw HTML/CSS if a `shadcn/ui` component (like `<Button>`, `<Input>`, `<Card>`) exists for it.
* **Responsiveness:** All UI must be mobile-first and fully responsive using Tailwind's `sm:`, `md:`, `lg:` prefixes.
* **Accessibility (a11y):** All components must be accessible (use `aria-` attributes, ensure keyboard navigation, etc.).
* **Icons:** Use icons from `lucide-react`.

## 5. Repository Structure

* `/app/api/`: All backend API routes.
* `/app/(dashboard)/`: All protected dashboard pages.
* `/components/ui/`: Unmodified `shadcn/ui` components.
* `/components/`: Custom components built using `shadcn/ui`.
* `/lib/supabase/`: Supabase client and server initializers.
* `/lib/db/`: SQL migration files (like `schema.sql`) and database helper functions.
