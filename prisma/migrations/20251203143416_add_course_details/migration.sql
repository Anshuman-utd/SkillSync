-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "learningOutcomes" TEXT,
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT';
