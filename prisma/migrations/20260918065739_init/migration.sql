-- CreateEnum
CREATE TYPE "Prayer" AS ENUM ('FAJR', 'DHUHR', 'ASR', 'MAGHRIB', 'ISHA');

-- CreateEnum
CREATE TYPE "PrayerStatus" AS ENUM ('ON_TIME', 'LATE', 'NOT_PERFORMED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "calculationMethod" TEXT NOT NULL DEFAULT 'MWL',
    "madhab" TEXT NOT NULL DEFAULT 'SHAFI',
    "city" TEXT,
    "country" TEXT,
    "theme" TEXT NOT NULL DEFAULT 'system',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrayerLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "prayer" "Prayer" NOT NULL,
    "status" "PrayerStatus" NOT NULL,
    "points" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrayerLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "PrayerLog_userId_date_idx" ON "PrayerLog"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "PrayerLog_userId_date_prayer_key" ON "PrayerLog"("userId", "date", "prayer");

-- AddForeignKey
ALTER TABLE "PrayerLog" ADD CONSTRAINT "PrayerLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
