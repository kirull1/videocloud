import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateCommentsTable1716650000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'comments',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'content',
            type: 'text',
          },
          {
            name: 'parent_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'video_id',
            type: 'uuid',
          },
          {
            name: 'likes_count',
            type: 'int',
            default: 0,
          },
          {
            name: 'dislikes_count',
            type: 'int',
            default: 0,
          },
          {
            name: 'replies_count',
            type: 'int',
            default: 0,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Add foreign key for user_id
    await queryRunner.createForeignKey(
      'comments',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
        name: 'FK_comments_user_id',
      }),
    );

    // Add foreign key for video_id
    await queryRunner.createForeignKey(
      'comments',
      new TableForeignKey({
        columnNames: ['video_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'videos',
        onDelete: 'CASCADE',
        name: 'FK_comments_video_id',
      }),
    );

    // Add foreign key for parent_id (self-referencing)
    await queryRunner.createForeignKey(
      'comments',
      new TableForeignKey({
        columnNames: ['parent_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'comments',
        onDelete: 'CASCADE',
        name: 'FK_comments_parent_id',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys by name
    await queryRunner.query(`
      ALTER TABLE "comments" DROP CONSTRAINT IF EXISTS "FK_comments_user_id"
    `);
    
    await queryRunner.query(`
      ALTER TABLE "comments" DROP CONSTRAINT IF EXISTS "FK_comments_video_id"
    `);
    
    await queryRunner.query(`
      ALTER TABLE "comments" DROP CONSTRAINT IF EXISTS "FK_comments_parent_id"
    `);

    // Drop the table
    await queryRunner.dropTable('comments');
  }
}