/*
  Warnings:

  - You are about to drop the column `creatorId` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Task` table. All the data in the column will be lost.
  - Added the required column `assignedToId` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taskType` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "taskType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "deadline" DATETIME NOT NULL,
    "attachments" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "assignedToId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "dynamicFields" TEXT,
    "slaBreached" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Task_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Task" ("attachments", "createdAt", "deadline", "department", "description", "id", "slaBreached", "status", "title", "updatedAt") SELECT "attachments", "createdAt", "deadline", "department", "description", "id", "slaBreached", "status", "title", "updatedAt" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
