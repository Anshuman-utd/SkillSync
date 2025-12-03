-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "progress" INTEGER NOT NULL DEFAULT 0;
