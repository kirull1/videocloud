import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixAvatarColumnName1716650600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if users table exists
    const usersTableExists = await queryRunner.hasTable('users');
    if (usersTableExists) {
      // Check if avatar_url column exists (snake_case)
      const hasSnakeCaseColumn = await queryRunner.hasColumn('users', 'avatar_url');
      if (hasSnakeCaseColumn) {
        // Rename avatar_url to avatarUrl
        await queryRunner.query(`
          ALTER TABLE "users" RENAME COLUMN "avatar_url" TO "avatarUrl"
        `);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Check if users table exists
    const usersTableExists = await queryRunner.hasTable('users');
    if (usersTableExists) {
      // Check if avatarUrl column exists (camelCase)
      const hasCamelCaseColumn = await queryRunner.hasColumn('users', 'avatarUrl');
      if (hasCamelCaseColumn) {
        // Rename avatarUrl back to avatar_url
        await queryRunner.query(`
          ALTER TABLE "users" RENAME COLUMN "avatarUrl" TO "avatar_url"
        `);
      }
    }
  }
}