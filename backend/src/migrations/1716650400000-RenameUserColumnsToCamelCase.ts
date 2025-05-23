import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameUserColumnsToCamelCase1716650400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if users table exists
    const usersTableExists = await queryRunner.hasTable('users');
    if (usersTableExists) {
      // Rename is_email_verified to isEmailVerified (if it exists)
      const hasSnakeCaseColumn = await queryRunner.hasColumn('users', 'is_email_verified');
      if (hasSnakeCaseColumn) {
        await queryRunner.query(`
          ALTER TABLE "users" RENAME COLUMN "is_email_verified" TO "isEmailVerified"
        `);
      }

      // Rename avatar_url to avatarUrl (if it exists)
      const hasAvatarUrlColumn = await queryRunner.hasColumn('users', 'avatar_url');
      if (hasAvatarUrlColumn) {
        await queryRunner.query(`
          ALTER TABLE "users" RENAME COLUMN "avatar_url" TO "avatarUrl"
        `);
      }

      // Rename created_at to createdAt (if it exists)
      const hasCreatedAtColumn = await queryRunner.hasColumn('users', 'created_at');
      if (hasCreatedAtColumn) {
        await queryRunner.query(`
          ALTER TABLE "users" RENAME COLUMN "created_at" TO "createdAt"
        `);
      }

      // Rename updated_at to updatedAt (if it exists)
      const hasUpdatedAtColumn = await queryRunner.hasColumn('users', 'updated_at');
      if (hasUpdatedAtColumn) {
        await queryRunner.query(`
          ALTER TABLE "users" RENAME COLUMN "updated_at" TO "updatedAt"
        `);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Check if users table exists
    const usersTableExists = await queryRunner.hasTable('users');
    if (usersTableExists) {
      // Rename isEmailVerified back to is_email_verified
      const hasCamelCaseColumn = await queryRunner.hasColumn('users', 'isEmailVerified');
      if (hasCamelCaseColumn) {
        await queryRunner.query(`
          ALTER TABLE "users" RENAME COLUMN "isEmailVerified" TO "is_email_verified"
        `);
      }

      // Rename avatarUrl back to avatar_url
      const hasAvatarUrlColumn = await queryRunner.hasColumn('users', 'avatarUrl');
      if (hasAvatarUrlColumn) {
        await queryRunner.query(`
          ALTER TABLE "users" RENAME COLUMN "avatarUrl" TO "avatar_url"
        `);
      }

      // Rename createdAt back to created_at
      const hasCreatedAtColumn = await queryRunner.hasColumn('users', 'createdAt');
      if (hasCreatedAtColumn) {
        await queryRunner.query(`
          ALTER TABLE "users" RENAME COLUMN "createdAt" TO "created_at"
        `);
      }

      // Rename updatedAt back to updated_at
      const hasUpdatedAtColumn = await queryRunner.hasColumn('users', 'updatedAt');
      if (hasUpdatedAtColumn) {
        await queryRunner.query(`
          ALTER TABLE "users" RENAME COLUMN "updatedAt" TO "updated_at"
        `);
      }
    }
  }
}