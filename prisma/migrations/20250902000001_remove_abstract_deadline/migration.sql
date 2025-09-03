-- CreateMigration
-- Remove abstractDeadline from Conference table

-- DropColumn
ALTER TABLE "Conference" DROP COLUMN "abstractDeadline";
