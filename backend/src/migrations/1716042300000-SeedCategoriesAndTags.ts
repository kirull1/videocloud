import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedCategoriesAndTags1716042300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Seed categories
    await queryRunner.query(`
      INSERT INTO "categories" (id, name, slug, description, "order")
      VALUES 
        (uuid_generate_v4(), 'Technology', 'technology', 'Videos about technology, gadgets, and software', 1),
        (uuid_generate_v4(), 'Education', 'education', 'Educational content and tutorials', 2),
        (uuid_generate_v4(), 'Entertainment', 'entertainment', 'Fun and entertaining videos', 3),
        (uuid_generate_v4(), 'Gaming', 'gaming', 'Video game content and gameplay', 4),
        (uuid_generate_v4(), 'Music', 'music', 'Music videos and performances', 5),
        (uuid_generate_v4(), 'Sports', 'sports', 'Sports highlights and commentary', 6),
        (uuid_generate_v4(), 'Travel', 'travel', 'Travel vlogs and destination guides', 7),
        (uuid_generate_v4(), 'Cooking', 'cooking', 'Recipes and cooking tutorials', 8)
    `);

    // Seed tags
    await queryRunner.query(`
      INSERT INTO "tags" (id, name, slug)
      VALUES 
        (uuid_generate_v4(), 'JavaScript', 'javascript'),
        (uuid_generate_v4(), 'Python', 'python'),
        (uuid_generate_v4(), 'Web Development', 'web-development'),
        (uuid_generate_v4(), 'Mobile', 'mobile'),
        (uuid_generate_v4(), 'AI', 'ai'),
        (uuid_generate_v4(), 'Machine Learning', 'machine-learning'),
        (uuid_generate_v4(), 'Tutorial', 'tutorial'),
        (uuid_generate_v4(), 'Review', 'review'),
        (uuid_generate_v4(), 'Gameplay', 'gameplay'),
        (uuid_generate_v4(), 'Vlog', 'vlog'),
        (uuid_generate_v4(), 'DIY', 'diy'),
        (uuid_generate_v4(), 'How-to', 'how-to'),
        (uuid_generate_v4(), 'News', 'news'),
        (uuid_generate_v4(), 'Comedy', 'comedy'),
        (uuid_generate_v4(), 'Documentary', 'documentary')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove seeded tags
    await queryRunner.query(`DELETE FROM "tags" WHERE slug IN (
      'javascript', 'python', 'web-development', 'mobile', 'ai', 
      'machine-learning', 'tutorial', 'review', 'gameplay', 'vlog', 
      'diy', 'how-to', 'news', 'comedy', 'documentary'
    )`);

    // Remove seeded categories
    await queryRunner.query(`DELETE FROM "categories" WHERE slug IN (
      'technology', 'education', 'entertainment', 'gaming', 
      'music', 'sports', 'travel', 'cooking'
    )`);
  }
}
