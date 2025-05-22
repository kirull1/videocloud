import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableColumn } from 'typeorm';

export class CreateReactionsTable1716650100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create reactions table
    await queryRunner.createTable(
      new Table({
        name: 'reactions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['like', 'dislike'],
            default: "'like'",
          },
          {
            name: 'userId',
            type: 'uuid',
          },
          {
            name: 'videoId',
            type: 'uuid',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        uniques: [
          {
            name: 'UQ_user_video_reaction',
            columnNames: ['userId', 'videoId'],
          },
        ],
      }),
      true,
    );

    // Add foreign key for userId
    await queryRunner.createForeignKey(
      'reactions',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Add foreign key for videoId
    await queryRunner.createForeignKey(
      'reactions',
      new TableForeignKey({
        columnNames: ['videoId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'videos',
        onDelete: 'CASCADE',
      }),
    );

    // Add likes_count and dislikes_count columns to videos table
    await queryRunner.addColumns('videos', [
      new TableColumn({
        name: 'likes_count',
        type: 'int',
        default: 0,
        isNullable: false,
      }),
      new TableColumn({
        name: 'dislikes_count',
        type: 'int',
        default: 0,
        isNullable: false,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop likes_count and dislikes_count columns from videos table
    await queryRunner.dropColumn('videos', 'likes_count');
    await queryRunner.dropColumn('videos', 'dislikes_count');

    // Get reactions table
    const table = await queryRunner.getTable('reactions');
    
    if (table) {
      // Drop foreign keys
      const userForeignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('userId') !== -1,
      );
      if (userForeignKey) {
        await queryRunner.dropForeignKey('reactions', userForeignKey);
      }

      const videoForeignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('videoId') !== -1,
      );
      if (videoForeignKey) {
        await queryRunner.dropForeignKey('reactions', videoForeignKey);
      }
    }

    // Drop the table
    await queryRunner.dropTable('reactions');
  }
}