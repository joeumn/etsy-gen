---
# This rule applies ONLY to SQL files in your lib/db directory
applyTo: "lib/db/*.sql"
---

## Guidelines for Writing Supabase SQL Migrations

* **RLS (Row Level Security):** All new tables **MUST** have RLS enabled.
    * `ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;`
* **Policies:** All new tables **MUST** have `SELECT`, `INSERT`, `UPDATE`, `DELETE` policies defined.
* **Policy Example (for user-owned data):**
    ```sql
    -- Allow users to see their own products
    CREATE POLICY "Allow individual read access"
    ON "public"."products"
    FOR SELECT
    USING (auth.uid() = user_id);

    -- Allow users to create their own products
    CREATE POLICY "Allow individual insert access"
    ON "public"."products"
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
    ```
* **Foreign Keys:** All `user_id` columns **MUST** be a foreign key to the `auth.users(id)` table.
    * `ALTER TABLE "public"."products" ADD CONSTRAINT "products_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;`
