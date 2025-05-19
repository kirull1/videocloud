import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTagsAndVideoTagsTables1716042200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if tags table already exists
    const tagsTableExists = await queryRunner.hasTable('tags');
    if (tagsTableExists) {
      console.log('Tags table already exists, skipping creation');
    } else {
      // Create tags table
      await queryRunner.query(`
        CREATE TABLE "tags" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "name" character varying NOT NULL,
          "slug" character varying NOT NULL,
          "usageCount" integer NOT NULL DEFAULT 0,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_tags_id" PRIMARY KEY ("id"),
          CONSTRAINT "UQ_tags_name" UNIQUE ("name"),
          CONSTRAINT "UQ_tags_slug" UNIQUE ("slug")
        )
      `);
    }

    // Check if video_tags table already exists
    const videoTagsTableExists = await queryRunner.hasTable('video_tags');
    if (videoTagsTableExists) {
      console.log('Video_tags table already exists, skipping creation');
    } else {
      // Create video_tags junction table
      await queryRunner.query(`
        CREATE TABLE "video_tags" (
          "videoId" uuid NOT NULL,
          "tagId" uuid NOT NULL,
          CONSTRAINT "PK_video_tags" PRIMARY KEY ("videoId", "tagId")
        )
      `);

      // Check if videos table exists
      const videosTableExists = await queryRunner.hasTable('videos');
      if (videosTableExists && tagsTableExists) {
        // Add foreign key constraints
        await queryRunner.query(`
          ALTER TABLE "video_tags" ADD CONSTRAINT "FK_video_tags_videoId"
          FOREIGN KEY ("videoId") REFERENCES "videos"("id")
          ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
          ALTER TABLE "video_tags" ADD CONSTRAINT "FK_video_tags_tagId"
          FOREIGN KEY ("tagId") REFERENCES "tags"("id")
          ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        // Add index for faster lookups
        await queryRunner.query(`
          CREATE INDEX "IDX_video_tags_videoId" ON "video_tags" ("videoId")
        `);

        await queryRunner.query(`
          CREATE INDEX "IDX_video_tags_tagId" ON "video_tags" ("tagId")
        `);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`
      DROP INDEX "IDX_video_tags_tagId"
    `);

    await queryRunner.query(`
      DROP INDEX "IDX_video_tags_videoId"
    `);

    // Drop foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "video_tags" DROP CONSTRAINT "FK_video_tags_tagId"
    `);

    await queryRunner.query(`
      ALTER TABLE "video_tags" DROP CONSTRAINT "FK_video_tags_videoId"
    `);

    // Drop tables
    await queryRunner.query(`
      DROP TABLE "video_tags"
    `);

    await queryRunner.query(`
      DROP TABLE "tags"
    `);
  }
}
