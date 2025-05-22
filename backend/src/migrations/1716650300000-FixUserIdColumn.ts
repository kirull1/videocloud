import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixUserIdColumn1716650300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if users table exists
    const usersTableExists = await queryRunner.hasTable('users');
    if (usersTableExists) {
      // Check if the id column exists
      const hasIdColumn = await queryRunner.hasColumn('users', 'id');
      if (hasIdColumn) {
        // Check if the userId column exists
        const hasUserIdColumn = await queryRunner.hasColumn('users', 'userId');
        if (!hasUserIdColumn) {
          // Create a userId column that references the id column
          await queryRunner.query(`
            ALTER TABLE "users" ADD COLUMN "userId" uuid GENERATED ALWAYS AS (id) STORED
          `);
        }
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Check if users table exists
    const usersTableExists = await queryRunner.hasTable('users');
    if (usersTableExists) {
      // Check if the userId column exists
      const hasUserIdColumn = await queryRunner.hasColumn('users', 'userId');
      if (hasUserIdColumn) {
        // Drop the userId column
        await queryRunner.query(`
          ALTER TABLE "users" DROP COLUMN "userId"
        `);
      }
    }
  }
}