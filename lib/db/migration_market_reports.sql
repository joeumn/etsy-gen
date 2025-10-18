-- lib/db/migration_market_reports.sql
CREATE TABLE IF NOT EXISTS "public"."MarketReports" (
  "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
  "createdAt" timestamp with time zone DEFAULT "now"() NOT NULL,
  "userId" "uuid" NOT NULL,
  "topic" "text" NOT NULL,
  "reportData" "jsonb" NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "MarketReports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."users"("id") ON DELETE CASCADE
);

ALTER TABLE "public"."MarketReports" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to manage their own reports"
ON "public"."MarketReports"
FOR ALL
USING (auth.uid() = "userId")
WITH CHECK (auth.uid() = "userId");
