import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVideosTable1716042000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if videos table already exists
    const tableExists = await queryRunner.hasTable('videos');
    if (tableExists) {
      console.log('Videos table already exists, skipping creation');
      return;
    }

    // Check if enum types already exist
    const statusEnumExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'video_status'
      );
    `);

    const visibilityEnumExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'video_visibility'
      );
    `);

    // Create enums if they don't exist
    if (!statusEnumExists[0].exists) {
      await queryRunner.query(
        `CREATE TYPE video_status AS ENUM ('processing', 'ready', 'failed');`,
      );
    }

    if (!visibilityEnumExists[0].exists) {
      await queryRunner.query(
        `CREATE TYPE video_visibility AS ENUM ('public', 'unlisted', 'private');`,
      );
    }

    // Create videos table
    await queryRunner.query(`
      CREATE TABLE videos (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status video_status NOT NULL DEFAULT 'processing',
        visibility video_visibility NOT NULL DEFAULT 'private',
        filename VARCHAR(255) NOT NULL,
        duration INTEGER,
        thumbnail_url VARCHAR(255),
        file_size BIGINT,
        views INTEGER NOT NULL DEFAULT 0,
        metadata JSONB,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX idx_videos_user_id ON videos(user_id);`);
    await queryRunner.query(`CREATE INDEX idx_videos_status ON videos(status);`);
    await queryRunner.query(`CREATE INDEX idx_videos_visibility ON videos(visibility);`);
    await queryRunner.query(`CREATE INDEX idx_videos_created_at ON videos(created_at);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE videos;
      DROP TYPE video_status;
      DROP TYPE video_visibility;
    `);
  }
}
