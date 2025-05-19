import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameColumnsToSnakeCase1716042400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if categories table exists
    const categoriesTableExists = await queryRunner.hasTable('categories');
    if (categoriesTableExists) {
      // Rename iconUrl to icon_url
      const hasIconUrlColumn = await queryRunner.hasColumn('categories', 'iconUrl');
      if (hasIconUrlColumn) {
        await queryRunner.query(`
          ALTER TABLE "categories" RENAME COLUMN "iconUrl" TO "icon_url"
        `);
      }

      // Rename createdAt to created_at
      const hasCreatedAtColumn = await queryRunner.hasColumn('categories', 'createdAt');
      if (hasCreatedAtColumn) {
        await queryRunner.query(`
          ALTER TABLE "categories" RENAME COLUMN "createdAt" TO "created_at"
        `);
      }

      // Rename updatedAt to updated_at
      const hasUpdatedAtColumn = await queryRunner.hasColumn('categories', 'updatedAt');
      if (hasUpdatedAtColumn) {
        await queryRunner.query(`
          ALTER TABLE "categories" RENAME COLUMN "updatedAt" TO "updated_at"
        `);
      }
    }

    // Check if videos table exists
    const videosTableExists = await queryRunner.hasTable('videos');
    if (videosTableExists) {
      // Rename categoryId to category_id
      const hasCategoryIdColumn = await queryRunner.hasColumn('videos', 'categoryId');
      if (hasCategoryIdColumn) {
        await queryRunner.query(`
          ALTER TABLE "videos" RENAME COLUMN "categoryId" TO "category_id"
        `);
      }

      // Update the foreign key constraint
      await queryRunner.query(`
        ALTER TABLE "videos" DROP CONSTRAINT IF EXISTS "FK_videos_categoryId"
      `);

      await queryRunner.query(`
        ALTER TABLE "videos" ADD CONSTRAINT "FK_videos_category_id" 
        FOREIGN KEY ("category_id") REFERENCES "categories"("id") 
        ON DELETE SET NULL ON UPDATE NO ACTION
      `);
    }

    // Check if tags table exists
    const tagsTableExists = await queryRunner.hasTable('tags');
    if (tagsTableExists) {
      // Rename usageCount to usage_count
      const hasUsageCountColumn = await queryRunner.hasColumn('tags', 'usageCount');
      if (hasUsageCountColumn) {
        await queryRunner.query(`
          ALTER TABLE "tags" RENAME COLUMN "usageCount" TO "usage_count"
        `);
      }

      // Rename createdAt to created_at
      const hasCreatedAtColumn = await queryRunner.hasColumn('tags', 'createdAt');
      if (hasCreatedAtColumn) {
        await queryRunner.query(`
          ALTER TABLE "tags" RENAME COLUMN "createdAt" TO "created_at"
        `);
      }

      // Rename updatedAt to updated_at
      const hasUpdatedAtColumn = await queryRunner.hasColumn('tags', 'updatedAt');
      if (hasUpdatedAtColumn) {
        await queryRunner.query(`
          ALTER TABLE "tags" RENAME COLUMN "updatedAt" TO "updated_at"
        `);
      }
    }

    // Check if video_tags table exists
    const videoTagsTableExists = await queryRunner.hasTable('video_tags');
    if (videoTagsTableExists) {
      // Rename videoId to video_id
      const hasVideoIdColumn = await queryRunner.hasColumn('video_tags', 'videoId');
      if (hasVideoIdColumn) {
        await queryRunner.query(`
          ALTER TABLE "video_tags" RENAME COLUMN "videoId" TO "video_id"
        `);
      }

      // Rename tagId to tag_id
      const hasTagIdColumn = await queryRunner.hasColumn('video_tags', 'tagId');
      if (hasTagIdColumn) {
        await queryRunner.query(`
          ALTER TABLE "video_tags" RENAME COLUMN "tagId" TO "tag_id"
        `);
      }

      // Update the primary key constraint
      await queryRunner.query(`
        ALTER TABLE "video_tags" DROP CONSTRAINT IF EXISTS "PK_video_tags"
      `);

      await queryRunner.query(`
        ALTER TABLE "video_tags" ADD CONSTRAINT "PK_video_tags" PRIMARY KEY ("video_id", "tag_id")
      `);

      // Update the foreign key constraints
      await queryRunner.query(`
        ALTER TABLE "video_tags" DROP CONSTRAINT IF EXISTS "FK_video_tags_videoId"
      `);

      await queryRunner.query(`
        ALTER TABLE "video_tags" DROP CONSTRAINT IF EXISTS "FK_video_tags_tagId"
      `);

      await queryRunner.query(`
        ALTER TABLE "video_tags" ADD CONSTRAINT "FK_video_tags_video_id" 
        FOREIGN KEY ("video_id") REFERENCES "videos"("id") 
        ON DELETE CASCADE ON UPDATE NO ACTION
      `);

      await queryRunner.query(`
        ALTER TABLE "video_tags" ADD CONSTRAINT "FK_video_tags_tag_id" 
        FOREIGN KEY ("tag_id") REFERENCES "tags"("id") 
        ON DELETE CASCADE ON UPDATE NO ACTION
      `);

      // Update the indexes
      await queryRunner.query(`
        DROP INDEX IF EXISTS "IDX_video_tags_videoId"
      `);

      await queryRunner.query(`
        DROP INDEX IF EXISTS "IDX_video_tags_tagId"
      `);

      await queryRunner.query(`
        CREATE INDEX "IDX_video_tags_video_id" ON "video_tags" ("video_id")
      `);

      await queryRunner.query(`
        CREATE INDEX "IDX_video_tags_tag_id" ON "video_tags" ("tag_id")
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert changes for categories table
    const categoriesTableExists = await queryRunner.hasTable('categories');
    if (categoriesTableExists) {
      // Rename icon_url back to iconUrl
      const hasIconUrlColumn = await queryRunner.hasColumn('categories', 'icon_url');
      if (hasIconUrlColumn) {
        await queryRunner.query(`
          ALTER TABLE "categories" RENAME COLUMN "icon_url" TO "iconUrl"
        `);
      }

      // Rename created_at back to createdAt
      const hasCreatedAtColumn = await queryRunner.hasColumn('categories', 'created_at');
      if (hasCreatedAtColumn) {
        await queryRunner.query(`
          ALTER TABLE "categories" RENAME COLUMN "created_at" TO "createdAt"
        `);
      }

      // Rename updated_at back to updatedAt
      const hasUpdatedAtColumn = await queryRunner.hasColumn('categories', 'updated_at');
      if (hasUpdatedAtColumn) {
        await queryRunner.query(`
          ALTER TABLE "categories" RENAME COLUMN "updated_at" TO "updatedAt"
        `);
      }
    }

    // Revert changes for videos table
    const videosTableExists = await queryRunner.hasTable('videos');
    if (videosTableExists) {
      // Rename category_id back to categoryId
      const hasCategoryIdColumn = await queryRunner.hasColumn('videos', 'category_id');
      if (hasCategoryIdColumn) {
        await queryRunner.query(`
          ALTER TABLE "videos" RENAME COLUMN "category_id" TO "categoryId"
        `);
      }

      // Update the foreign key constraint
      await queryRunner.query(`
        ALTER TABLE "videos" DROP CONSTRAINT IF EXISTS "FK_videos_category_id"
      `);

      await queryRunner.query(`
        ALTER TABLE "videos" ADD CONSTRAINT "FK_videos_categoryId" 
        FOREIGN KEY ("categoryId") REFERENCES "categories"("id") 
        ON DELETE SET NULL ON UPDATE NO ACTION
      `);
    }

    // Revert changes for tags table
    const tagsTableExists = await queryRunner.hasTable('tags');
    if (tagsTableExists) {
      // Rename usage_count back to usageCount
      const hasUsageCountColumn = await queryRunner.hasColumn('tags', 'usage_count');
      if (hasUsageCountColumn) {
        await queryRunner.query(`
          ALTER TABLE "tags" RENAME COLUMN "usage_count" TO "usageCount"
        `);
      }

      // Rename created_at back to createdAt
      const hasCreatedAtColumn = await queryRunner.hasColumn('tags', 'created_at');
      if (hasCreatedAtColumn) {
        await queryRunner.query(`
          ALTER TABLE "tags" RENAME COLUMN "created_at" TO "createdAt"
        `);
      }

      // Rename updated_at back to updatedAt
      const hasUpdatedAtColumn = await queryRunner.hasColumn('tags', 'updated_at');
      if (hasUpdatedAtColumn) {
        await queryRunner.query(`
          ALTER TABLE "tags" RENAME COLUMN "updated_at" TO "updatedAt"
        `);
      }
    }

    // Revert changes for video_tags table
    const videoTagsTableExists = await queryRunner.hasTable('video_tags');
    if (videoTagsTableExists) {
      // Rename video_id back to videoId
      const hasVideoIdColumn = await queryRunner.hasColumn('video_tags', 'video_id');
      if (hasVideoIdColumn) {
        await queryRunner.query(`
          ALTER TABLE "video_tags" RENAME COLUMN "video_id" TO "videoId"
        `);
      }

      // Rename tag_id back to tagId
      const hasTagIdColumn = await queryRunner.hasColumn('video_tags', 'tag_id');
      if (hasTagIdColumn) {
        await queryRunner.query(`
          ALTER TABLE "video_tags" RENAME COLUMN "tag_id" TO "tagId"
        `);
      }

      // Update the primary key constraint
      await queryRunner.query(`
        ALTER TABLE "video_tags" DROP CONSTRAINT IF EXISTS "PK_video_tags"
      `);

      await queryRunner.query(`
        ALTER TABLE "video_tags" ADD CONSTRAINT "PK_video_tags" PRIMARY KEY ("videoId", "tagId")
      `);

      // Update the foreign key constraints
      await queryRunner.query(`
        ALTER TABLE "video_tags" DROP CONSTRAINT IF EXISTS "FK_video_tags_video_id"
      `);

      await queryRunner.query(`
        ALTER TABLE "video_tags" DROP CONSTRAINT IF EXISTS "FK_video_tags_tag_id"
      `);

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

      // Update the indexes
      await queryRunner.query(`
        DROP INDEX IF EXISTS "IDX_video_tags_video_id"
      `);

      await queryRunner.query(`
        DROP INDEX IF EXISTS "IDX_video_tags_tag_id"
      `);

      await queryRunner.query(`
        CREATE INDEX "IDX_video_tags_videoId" ON "video_tags" ("videoId")
      `);

      await queryRunner.query(`
        CREATE INDEX "IDX_video_tags_tagId" ON "video_tags" ("tagId")
      `);
    }
  }
}
