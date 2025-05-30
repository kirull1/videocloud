import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddChannelIdToUsers1716650700000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add channelId column to users table
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'channelId',
        type: 'uuid',
        isNullable: true,
        isUnique: true,
      }),
    );

    // Add foreign key constraint
    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        columnNames: ['channelId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'channels',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key first
    const table = await queryRunner.getTable('users');
    if (table) {
      const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf('channelId') !== -1);
      if (foreignKey) {
        await queryRunner.dropForeignKey('users', foreignKey);
      }
    }

    // Then drop the column
    await queryRunner.dropColumn('users', 'channelId');
  }
} 