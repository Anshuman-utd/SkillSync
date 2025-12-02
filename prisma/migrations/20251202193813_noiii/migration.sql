/*
  Warnings:

  - You are about to drop the column `slug` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the `CourseCategory` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `categoryId` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CourseCategory" DROP CONSTRAINT "CourseCategory_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "CourseCategory" DROP CONSTRAINT "CourseCategory_courseId_fkey";

-- DropIndex
DROP INDEX "Category_name_key";

-- DropIndex
DROP INDEX "Category_slug_key";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "slug";

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "imageUrl",
ADD COLUMN     "categoryId" INTEGER NOT NULL,
ADD COLUMN     "image" TEXT NOT NULL,
ALTER COLUMN "level" DROP DEFAULT,
ALTER COLUMN "durationWeeks" DROP DEFAULT,
ALTER COLUMN "rating" SET DEFAULT 0.0;

-- DropTable
DROP TABLE "CourseCategory";

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_studentId_courseId_key" ON "Enrollment"("studentId", "courseId");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
