import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFilePathToVideos1716043000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // The file_path column already exists, so we don't need to add it
    // We just need to make it nullable to support our S3 integration
    await queryRunner.query(`
      ALTER TABLE videos
      ALTER COLUMN file_path DROP NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert the change by making file_path required again
    await queryRunner.query(`
      ALTER TABLE videos
      ALTER COLUMN file_path SET NOT NULL;
    `);
  }
}
