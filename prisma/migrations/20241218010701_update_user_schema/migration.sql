-- AlterTable
ALTER TABLE "User" ADD COLUMN     "socialAuth" TEXT,
ALTER COLUMN "password" DROP NOT NULL;
