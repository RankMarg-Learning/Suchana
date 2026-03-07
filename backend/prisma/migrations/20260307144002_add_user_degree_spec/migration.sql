-- AlterTable
ALTER TABLE "User" ADD COLUMN     "degree" TEXT,
ADD COLUMN     "specialization" TEXT;

-- CreateIndex
CREATE INDEX "User_degree_idx" ON "User"("degree");

-- CreateIndex
CREATE INDEX "User_specialization_idx" ON "User"("specialization");
