import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameVideoColumnsToCamelCase1716650500000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if videos table exists
    const videosTableExists = await queryRunner.hasTable('videos');
    if (videosTableExists) {
      // Rename file_path to filePath
      const hasFilePathColumn = await queryRunner.hasColumn('videos', 'file_path');
      if (hasFilePathColumn) {
        await queryRunner.query(`
          ALTER TABLE "videos" RENAME COLUMN "file_path" TO "filePath"
        `);
      }

      // Rename thumbnail_path to thumbnailUrl
      const hasThumbnailPathColumn = await queryRunner.hasColumn('videos', 'thumbnail_path');
      if (hasThumbnailPathColumn) {
        await queryRunner.query(`
          ALTER TABLE "videos" RENAME COLUMN "thumbnail_path" TO "thumbnailUrl"
        `);
      }

      // Rename likes_count to likesCount
      const hasLikesCountColumn = await queryRunner.hasColumn('videos', 'likes_count');
      if (hasLikesCountColumn) {
        await queryRunner.query(`
          ALTER TABLE "videos" RENAME COLUMN "likes_count" TO "likesCount"
        `);
      }

      // Rename dislikes_count to dislikesCount
      const hasDislikesCountColumn = await queryRunner.hasColumn('videos', 'dislikes_count');
      if (hasDislikesCountColumn) {
        await queryRunner.query(`
          ALTER TABLE "videos" RENAME COLUMN "dislikes_count" TO "dislikesCount"
        `);
      }

      // Rename is_public to isPublic
      const hasIsPublicColumn = await queryRunner.hasColumn('videos', 'is_public');
      if (hasIsPublicColumn) {
        await queryRunner.query(`
          ALTER TABLE "videos" RENAME COLUMN "is_public" TO "isPublic"
        `);
      }

      // Rename user_id to userId
      const hasUserIdColumn = await queryRunner.hasColumn('videos', 'user_id');
      if (hasUserIdColumn) {
        await queryRunner.query(`
          ALTER TABLE "videos" RENAME COLUMN "user_id" TO "userId"
        `);
      }

      // Rename channel_id to channelId
      const hasChannelIdColumn = await queryRunner.hasColumn('videos', 'channel_id');
      if (hasChannelIdColumn) {
        await queryRunner.query(`
          ALTER TABLE "videos" RENAME COLUMN "channel_id" TO "channelId"
        `);
      }

      // Rename category_id to categoryId
      const hasCategoryIdColumn = await queryRunner.hasColumn('videos', 'category_id');
      if (hasCategoryIdColumn) {
        await queryRunner.query(`
          ALTER TABLE "videos" RENAME COLUMN "category_id" TO "categoryId"
        `);
      }

      // Rename created_at to createdAt
      const hasCreatedAtColumn = await queryRunner.hasColumn('videos', 'created_at');
      if (hasCreatedAtColumn) {
        await queryRunner.query(`
          ALTER TABLE "videos" RENAME COLUMN "created_at" TO "createdAt"
        `);
      }

      // Rename updated_at to updatedAt
      const hasUpdatedAtColumn = await queryRunner.hasColumn('videos', 'updated_at');
      if (hasUpdatedAtColumn) {
        await queryRunner.query(`
          ALTER TABLE "videos" RENAME COLUMN "updated_at" TO "updatedAt"
        `);
      }
    }

    // Check if video_tags table exists
    const videoTagsTableExists = await queryRunner.hasTable('video_tags');
    if (videoTagsTableExists) {
      // Rename the table itself
      await queryRunner.query(`
        ALTER TABLE "video_tags" RENAME TO "videoTags"
      `);

      // Rename video_id to videoId
      const hasVideoIdColumn = await queryRunner.hasColumn('videoTags', 'video_id');
      if (hasVideoIdColumn) {
        await queryRunner.query(`
          ALTER TABLE "videoTags" RENAME COLUMN "video_id" TO "videoId"
        `);
      }

      // Rename tag_id to tagId
      const hasTagIdColumn = await queryRunner.hasColumn('videoTags', 'tag_id');
      if (hasTagIdColumn) {
        await queryRunner.query(`
          ALTER TABLE "videoTags" RENAME COLUMN "tag_id" TO "tagId"
        `);
      }

      // Update the primary key constraint
      await queryRunner.query(`
        ALTER TABLE "videoTags" DROP CONSTRAINT IF EXISTS "PK_video_tags"
      `);

      await queryRunner.query(`
        ALTER TABLE "videoTags" ADD CONSTRAINT "PK_videoTags" PRIMARY KEY ("videoId", "tagId")
      `);

      // Update the foreign key constraints
      await queryRunner.query(`
        ALTER TABLE "videoTags" DROP CONSTRAINT IF EXISTS "FK_video_tags_video_id"
      `);

      await queryRunner.query(`
        ALTER TABLE "videoTags" DROP CONSTRAINT IF EXISTS "FK_video_tags_tag_id"
      `);

      await queryRunner.query(`
        ALTER TABLE "videoTags" ADD CONSTRAINT "FK_videoTags_videoId" 
        FOREIGN KEY ("videoId") REFERENCES "videos"("id") 
        ON DELETE CASCADE ON UPDATE NO ACTION
      `);

      await queryRunner.query(`
        ALTER TABLE "videoTags" ADD CONSTRAINT "FK_videoTags_tagId" 
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
        CREATE INDEX "IDX_videoTags_videoId" ON "videoTags" ("videoId")
      `);

      await queryRunner.query(`
        CREATE INDEX "IDX_videoTags_tagId" ON "videoTags" ("tagId")
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Check if videos table exists
    const videosTableExists = await queryRunner.hasTable('videos');
    if (videosTableExists) {
      // Rename filePath back to file_path
      const hasFilePathColumn = await queryRunner.hasColumn('videos', 'filePath');
      if (hasFilePathColumn) {
        await queryRunner.query(`
          ALTER TABLE "videos" RENAME COLUMN "filePath" TO "file_path"
        `);
      }

      // Rename thumbnailUrl back to thumbnail_path
      const hasThumbnailUrlColumn = await queryRunner.hasColumn('videos', 'thumbnailUrl');
      if (hasThumbnailUrlColumn) {
        await queryRunner.query(`
          ALTER TABLE "videos" RENAME COLUMN "thumbnailUrl" TO "thumbnail_path"
        `);
      }

      // Rename likesCount back to likes_count
      const hasLikesCountColumn = await queryRunner.hasColumn('videos', 'likesCount');
      if (hasLikesCountColumn) {
        await queryRunner.query(`
          ALTER TABLE "videos" RENAME COLUMN "likesCount" TO "likes_count"
        `);
      }

      // Rename dislikesCount back to dislikes_count
      const hasDislikesCountColumn = await queryRunner.hasColumn('videos', 'dislikesCount');
      if (hasDislikesCountColumn) {
        await queryRunner.query(`
          ALTER TABLE "videos" RENAME COLUMN "dislikesCount" TO "dislikes_count"
        `);
      }

      // Rename isPublic back to is_public
      const hasIsPublicColumn = await queryRunner.hasColumn('videos', 'isPublic');
      if (hasIsPublicColumn) {
        await queryRunner.query(`
          ALTER TABLE "videos" RENAME COLUMN "isPublic" TO "is_public"
        `);
      }

      // Rename userId back to user_id
      const hasUserIdColumn = await queryRunner.hasColumn('videos', 'userId');
      if (hasUserIdColumn) {
        await queryRunner.query(`
          ALTER TABLE "videos" RENAME COLUMN "userId" TO "user_id"
        `);
      }

      // Rename channelId back to channel_id
      const hasChannelIdColumn = await queryRunner.hasColumn('videos', 'channelId');
      if (hasChannelIdColumn) {
        await queryRunner.query(`
          ALTER TABLE "videos" RENAME COLUMN "channelId" TO "channel_id"
        `);
      }

      // Rename categoryId back to category_id
      const hasCategoryIdColumn = await queryRunner.hasColumn('videos', 'categoryId');
      if (hasCategoryIdColumn) {
        await queryRunner.query(`
          ALTER TABLE "videos" RENAME COLUMN "categoryId" TO "category_id"
        `);
      }

      // Rename createdAt back to created_at
      const hasCreatedAtColumn = await queryRunner.hasColumn('videos', 'createdAt');
      if (hasCreatedAtColumn) {
        await queryRunner.query(`
          ALTER TABLE "videos" RENAME COLUMN "createdAt" TO "created_at"
        `);
      }

      // Rename updatedAt back to updated_at
      const hasUpdatedAtColumn = await queryRunner.hasColumn('videos', 'updatedAt');
      if (hasUpdatedAtColumn) {
        await queryRunner.query(`
          ALTER TABLE "videos" RENAME COLUMN "updatedAt" TO "updated_at"
        `);
      }
    }

    // Check if videoTags table exists
    const videoTagsTableExists = await queryRunner.hasTable('videoTags');
    if (videoTagsTableExists) {
      // Rename the table itself
      await queryRunner.query(`
        ALTER TABLE "videoTags" RENAME TO "video_tags"
      `);

      // Rename videoId back to video_id
      const hasVideoIdColumn = await queryRunner.hasColumn('video_tags', 'videoId');
      if (hasVideoIdColumn) {
        await queryRunner.query(`
          ALTER TABLE "video_tags" RENAME COLUMN "videoId" TO "video_id"
        `);
      }

      // Rename tagId back to tag_id
      const hasTagIdColumn = await queryRunner.hasColumn('video_tags', 'tagId');
      if (hasTagIdColumn) {
        await queryRunner.query(`
          ALTER TABLE "video_tags" RENAME COLUMN "tagId" TO "tag_id"
        `);
      }

      // Update the primary key constraint
      await queryRunner.query(`
        ALTER TABLE "video_tags" DROP CONSTRAINT IF EXISTS "PK_videoTags"
      `);

      await queryRunner.query(`
        ALTER TABLE "video_tags" ADD CONSTRAINT "PK_video_tags" PRIMARY KEY ("video_id", "tag_id")
      `);

      // Update the foreign key constraints
      await queryRunner.query(`
        ALTER TABLE "video_tags" DROP CONSTRAINT IF EXISTS "FK_videoTags_videoId"
      `);

      await queryRunner.query(`
        ALTER TABLE "video_tags" DROP CONSTRAINT IF EXISTS "FK_videoTags_tagId"
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
        DROP INDEX IF EXISTS "IDX_videoTags_videoId"
      `);

      await queryRunner.query(`
        DROP INDEX IF EXISTS "IDX_videoTags_tagId"
      `);

      await queryRunner.query(`
        CREATE INDEX "IDX_video_tags_video_id" ON "video_tags" ("video_id")
      `);

      await queryRunner.query(`
        CREATE INDEX "IDX_video_tags_tag_id" ON "video_tags" ("tag_id")
      `);
    }
  }
}