import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAvatarUrlToUsers1712500000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users
      ADD COLUMN "avatarUrl" varchar NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users
      DROP COLUMN "avatarUrl";
    `);
  }
}
