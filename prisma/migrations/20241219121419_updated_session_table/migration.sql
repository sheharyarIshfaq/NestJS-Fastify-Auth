/*
  Warnings:

  - You are about to drop the column `deviceInfo` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `ipAddress` on the `Session` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Session" DROP COLUMN "deviceInfo",
DROP COLUMN "ipAddress";
