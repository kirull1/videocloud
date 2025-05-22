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
            name: 'parentId',
            type: 'uuid',
            isNullable: true,
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
            name: 'likesCount',
            type: 'int',
            default: 0,
          },
          {
            name: 'dislikesCount',
            type: 'int',
            default: 0,
          },
          {
            name: 'repliesCount',
            type: 'int',
            default: 0,
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
      }),
      true,
    );

    // Add foreign key for userId
    await queryRunner.createForeignKey(
      'comments',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Add foreign key for videoId
    await queryRunner.createForeignKey(
      'comments',
      new TableForeignKey({
        columnNames: ['videoId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'videos',
        onDelete: 'CASCADE',
      }),
    );

    // Add foreign key for parentId (self-referencing)
    await queryRunner.createForeignKey(
      'comments',
      new TableForeignKey({
        columnNames: ['parentId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'comments',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('comments');
    
    if (table) {
      // Drop foreign keys
      const userForeignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('userId') !== -1,
      );
      if (userForeignKey) {
        await queryRunner.dropForeignKey('comments', userForeignKey);
      }

      const videoForeignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('videoId') !== -1,
      );
      if (videoForeignKey) {
        await queryRunner.dropForeignKey('comments', videoForeignKey);
      }

      const parentForeignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('parentId') !== -1,
      );
      if (parentForeignKey) {
        await queryRunner.dropForeignKey('comments', parentForeignKey);
      }
    }

    // Drop the table
    await queryRunner.dropTable('comments');
  }
}