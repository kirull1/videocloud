import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCategoriesTable1716042100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if categories table already exists
    const tableExists = await queryRunner.hasTable('categories');
    if (tableExists) {
      console.log('Categories table already exists, skipping creation');
      return;
    }

    // Create categories table
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "description" character varying,
        "iconUrl" character varying,
        "order" integer NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_categories_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_categories_name" UNIQUE ("name"),
        CONSTRAINT "UQ_categories_slug" UNIQUE ("slug")
      )
    `);

    // Check if videos table exists
    const videosTableExists = await queryRunner.hasTable('videos');
    if (videosTableExists) {
      // Check if categoryId column already exists in videos table
      const hasColumn = await queryRunner.hasColumn('videos', 'categoryId');
      if (!hasColumn) {
        await queryRunner.query(`
          ALTER TABLE "videos" ADD "categoryId" uuid NULL
        `);

        await queryRunner.query(`
          ALTER TABLE "videos" ADD CONSTRAINT "FK_videos_categoryId"
          FOREIGN KEY ("categoryId") REFERENCES "categories"("id")
          ON DELETE SET NULL ON UPDATE NO ACTION
        `);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "videos" DROP CONSTRAINT "FK_videos_categoryId"
    `);

    await queryRunner.query(`
      ALTER TABLE "videos" DROP COLUMN "categoryId"
    `);

    await queryRunner.query(`
      DROP TABLE "categories"
    `);
  }
}
