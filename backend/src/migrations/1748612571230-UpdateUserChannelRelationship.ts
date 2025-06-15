import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUserChannelRelationship1748612571230 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    try {
      // First check if the users table exists
      const usersTableExists = await queryRunner.hasTable('users');
      if (!usersTableExists) {
        console.log('Users table does not exist, skipping migration');
        return;
      }

      // Check if the channels table exists
      const channelsTableExists = await queryRunner.hasTable('channels');
      if (!channelsTableExists) {
        console.log('Channels table does not exist, skipping migration');
        return;
      }

      // Check if the channelId column exists in the users table
      const columns = await queryRunner.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'channelId'
      `);

      // If the column doesn't exist, add it
      if (columns.length === 0) {
        console.log('Adding channelId column to users table');
        await queryRunner.query(`
          ALTER TABLE "users" ADD COLUMN "channelId" uuid UNIQUE REFERENCES "channels"("id") ON DELETE SET NULL
        `);
      } else {
        console.log('channelId column already exists in users table');
      }

      // Update all users with matching channels
      console.log('Updating users with matching channels');
      await queryRunner.query(`
        UPDATE "users" u
        SET "channelId" = c.id
        FROM "channels" c
        WHERE u.id = c."user_id" AND u."channelId" IS NULL
      `);
      
      console.log('UpdateUserChannelRelationship migration completed successfully');
    } catch (error) {
      console.error('Error in UpdateUserChannelRelationship migration:', error);
      throw error;
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    try {
      // Check if the users table exists
      const usersTableExists = await queryRunner.hasTable('users');
      if (!usersTableExists) {
        console.log('Users table does not exist, skipping migration reversion');
        return;
      }

      // Check if the channelId column exists before trying to drop it
      const columns = await queryRunner.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'channelId'
      `);

      if (columns.length > 0) {
        console.log('Removing channelId column from users table');
        await queryRunner.query(`
          ALTER TABLE "users" DROP COLUMN IF EXISTS "channelId"
        `);
      } else {
        console.log('channelId column does not exist in users table, nothing to revert');
      }
      
      console.log('UpdateUserChannelRelationship migration reversion completed successfully');
    } catch (error) {
      console.error('Error in reverting UpdateUserChannelRelationship migration:', error);
      throw error;
    }
  }
} 