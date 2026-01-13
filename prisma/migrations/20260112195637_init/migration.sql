-- CreateTable
CREATE TABLE "Computation" (
    "id" TEXT NOT NULL,
    "a" DOUBLE PRECISION NOT NULL,
    "b" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Computation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "computationId" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "result" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Job_computationId_idx" ON "Job"("computationId");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_computationId_fkey" FOREIGN KEY ("computationId") REFERENCES "Computation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
