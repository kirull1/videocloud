import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUserChannelRelationship1748612571230 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First check if the channelId column exists in the users table
    const columns = await queryRunner.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'channelId'
    `);

    // If the column doesn't exist, add it
    if (columns.length === 0) {
      await queryRunner.query(`
        ALTER TABLE "users" ADD COLUMN "channelId" uuid UNIQUE REFERENCES "channels"("id") ON DELETE SET NULL
      `);
    }

    // Update all users with matching channels
    await queryRunner.query(`
      UPDATE "users" u
      SET "channelId" = c.id
      FROM "channels" c
      WHERE u.id = c."user_id" AND u."channelId" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert the changes
    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN IF EXISTS "channelId"
    `);
  }
} 