-- CreateTable
CREATE TABLE "SearchTermStat" (
    "term" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SearchTermStat_pkey" PRIMARY KEY ("term")
);

-- CreateIndex
CREATE INDEX "SearchTermStat_count_idx" ON "SearchTermStat"("count");
