import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsEmailVerifiedToUsers1712500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users
      ADD COLUMN "isEmailVerified" boolean NOT NULL DEFAULT false;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users
      DROP COLUMN "isEmailVerified";
    `);
  }
}
