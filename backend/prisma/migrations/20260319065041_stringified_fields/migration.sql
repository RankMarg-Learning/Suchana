-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "additionalDetails" TEXT,
ADD COLUMN     "salary" TEXT,
ALTER COLUMN "applicationFee" SET DATA TYPE TEXT,
ALTER COLUMN "qualificationCriteria" SET DATA TYPE TEXT,
ALTER COLUMN "totalVacancies" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "StagedExam" ADD COLUMN     "additionalDetails" TEXT,
ADD COLUMN     "salary" TEXT,
ALTER COLUMN "qualificationCriteria" SET DATA TYPE TEXT,
ALTER COLUMN "applicationFee" SET DATA TYPE TEXT,
ALTER COLUMN "totalVacancies" SET DATA TYPE TEXT;
