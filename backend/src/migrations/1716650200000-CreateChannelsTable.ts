import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableColumn } from 'typeorm';

export class CreateChannelsTable1716650200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create channels table
    await queryRunner.createTable(
      new Table({
        name: 'channels',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'description',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'banner_url',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'custom_url',
            type: 'varchar',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'theme_color',
            type: 'varchar',
            default: "'#41A4FF'",
            isNullable: true,
          },
          {
            name: 'featured_video_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'total_views',
            type: 'int',
            default: 0,
          },
          {
            name: 'subscriber_count',
            type: 'int',
            default: 0,
          },
          {
            name: 'video_count',
            type: 'int',
            default: 0,
          },
          {
            name: 'user_id',
            type: 'uuid',
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
      'channels',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
        name: 'FK_channels_user_id',
      }),
    );

    // Add channel_id column to videos table
    await queryRunner.addColumn(
      'videos',
      new TableColumn({
        name: 'channel_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    // Add foreign key for channel_id in videos table
    await queryRunner.createForeignKey(
      'videos',
      new TableForeignKey({
        columnNames: ['channel_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'channels',
        onDelete: 'SET NULL',
        name: 'FK_videos_channel_id',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key for channel_id in videos table
    await queryRunner.query(`
      ALTER TABLE "videos" DROP CONSTRAINT IF EXISTS "FK_videos_channel_id"
    `);

    // Drop channel_id column from videos table
    await queryRunner.dropColumn('videos', 'channel_id');

    // Drop foreign key for user_id in channels table
    await queryRunner.query(`
      ALTER TABLE "channels" DROP CONSTRAINT IF EXISTS "FK_channels_user_id"
    `);

    // Drop channels table
    await queryRunner.dropTable('channels');
  }
}