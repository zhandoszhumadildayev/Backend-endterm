CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "Role" AS ENUM ('PARENT', 'ADMIN');
CREATE TYPE "ExerciseType" AS ENUM ('PHONICS', 'HANDWRITING', 'SIGHT_WORDS', 'VOCABULARY');
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');
CREATE TYPE "NotificationType" AS ENUM ('MILESTONE', 'STREAK_REMINDER', 'WEEKLY_SUMMARY');

CREATE TABLE "User" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "name" TEXT,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'PARENT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "RefreshToken" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

CREATE TABLE "Child" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "parentId" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "age" INTEGER NOT NULL,
  "avatarUrl" TEXT,
  "learningLevel" TEXT NOT NULL DEFAULT 'Level 1',
  "xp" INTEGER NOT NULL DEFAULT 0,
  "level" INTEGER NOT NULL DEFAULT 1,
  "streak" INTEGER NOT NULL DEFAULT 0,
  "lastActiveDate" TIMESTAMP(3),
  "progressPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Child_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Child_parentId_idx" ON "Child"("parentId");
CREATE INDEX "Child_age_idx" ON "Child"("age");
CREATE INDEX "Child_xp_idx" ON "Child"("xp");

CREATE TABLE "Unit" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "title" JSONB NOT NULL,
  "description" JSONB,
  "orderNo" INTEGER NOT NULL,
  "difficulty" "Difficulty" NOT NULL DEFAULT 'EASY',
  "published" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Unit_published_idx" ON "Unit"("published");
CREATE INDEX "Unit_orderNo_idx" ON "Unit"("orderNo");

CREATE TABLE "Lesson" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "unitId" TEXT NOT NULL,
  "title" JSONB NOT NULL,
  "instructions" JSONB,
  "orderNo" INTEGER NOT NULL,
  "difficulty" "Difficulty" NOT NULL DEFAULT 'EASY',
  "xpReward" INTEGER NOT NULL DEFAULT 10,
  "published" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Lesson_unitId_idx" ON "Lesson"("unitId");
CREATE INDEX "Lesson_published_idx" ON "Lesson"("published");
CREATE INDEX "Lesson_difficulty_idx" ON "Lesson"("difficulty");
CREATE INDEX "Lesson_orderNo_idx" ON "Lesson"("orderNo");

CREATE TABLE "Exercise" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "lessonId" TEXT NOT NULL,
  "type" "ExerciseType" NOT NULL,
  "prompt" JSONB NOT NULL,
  "options" JSONB,
  "correctAnswer" TEXT NOT NULL,
  "orderNo" INTEGER NOT NULL,
  "difficulty" "Difficulty" NOT NULL DEFAULT 'EASY',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Exercise_lessonId_idx" ON "Exercise"("lessonId");
CREATE INDEX "Exercise_type_idx" ON "Exercise"("type");
CREATE INDEX "Exercise_difficulty_idx" ON "Exercise"("difficulty");

CREATE TABLE "ExerciseResult" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "childId" TEXT NOT NULL,
  "exerciseId" TEXT NOT NULL,
  "answer" TEXT NOT NULL,
  "correct" BOOLEAN NOT NULL,
  "timeTakenSeconds" INTEGER NOT NULL,
  "score" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ExerciseResult_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ExerciseResult_childId_idx" ON "ExerciseResult"("childId");
CREATE INDEX "ExerciseResult_exerciseId_idx" ON "ExerciseResult"("exerciseId");
CREATE INDEX "ExerciseResult_createdAt_idx" ON "ExerciseResult"("createdAt");

CREATE TABLE "LessonProgress" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "childId" TEXT NOT NULL,
  "lessonId" TEXT NOT NULL,
  "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "xpAwarded" INTEGER NOT NULL,
  CONSTRAINT "LessonProgress_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "LessonProgress_childId_lessonId_key" ON "LessonProgress"("childId", "lessonId");
CREATE INDEX "LessonProgress_childId_idx" ON "LessonProgress"("childId");
CREATE INDEX "LessonProgress_lessonId_idx" ON "LessonProgress"("lessonId");

CREATE TABLE "Badge" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Badge_code_key" ON "Badge"("code");

CREATE TABLE "ChildBadge" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "childId" TEXT NOT NULL,
  "badgeId" TEXT NOT NULL,
  "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ChildBadge_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ChildBadge_childId_badgeId_key" ON "ChildBadge"("childId", "badgeId");
CREATE INDEX "ChildBadge_childId_idx" ON "ChildBadge"("childId");
CREATE INDEX "ChildBadge_badgeId_idx" ON "ChildBadge"("badgeId");

CREATE TABLE "Notification" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "parentId" TEXT NOT NULL,
  "childId" TEXT,
  "type" "NotificationType" NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "read" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Notification_parentId_idx" ON "Notification"("parentId");
CREATE INDEX "Notification_read_idx" ON "Notification"("read");
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

CREATE TABLE "ActivityLog" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "adminId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "entity" TEXT NOT NULL,
  "entityId" TEXT,
  "before" JSONB,
  "after" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ActivityLog_adminId_idx" ON "ActivityLog"("adminId");
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");
CREATE INDEX "ActivityLog_entity_idx" ON "ActivityLog"("entity");

ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Child" ADD CONSTRAINT "Child_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExerciseResult" ADD CONSTRAINT "ExerciseResult_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExerciseResult" ADD CONSTRAINT "ExerciseResult_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChildBadge" ADD CONSTRAINT "ChildBadge_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChildBadge" ADD CONSTRAINT "ChildBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
