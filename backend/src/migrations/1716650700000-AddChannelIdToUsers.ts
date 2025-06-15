import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddChannelIdToUsers1716650700000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    try {
      // Check if users table exists
      const usersTableExists = await queryRunner.hasTable('users');
      if (!usersTableExists) {
        console.log('Users table does not exist, skipping migration');
        return;
      }

      // Check if channels table exists
      const channelsTableExists = await queryRunner.hasTable('channels');
      if (!channelsTableExists) {
        console.log('Channels table does not exist, skipping migration');
        return;
      }

      // Check if channelId column already exists
      const columns = await queryRunner.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'channelId'
      `);

      if (columns.length === 0) {
        console.log('Adding channelId column to users table');
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
            name: 'FK_users_channelId'
          }),
        );
      } else {
        console.log('channelId column already exists in users table, skipping column creation');
      }
      
      console.log('AddChannelIdToUsers migration completed successfully');
    } catch (error) {
      console.error('Error in AddChannelIdToUsers migration:', error);
      throw error;
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    try {
      // Check if users table exists
      const usersTableExists = await queryRunner.hasTable('users');
      if (!usersTableExists) {
        console.log('Users table does not exist, skipping migration reversion');
        return;
      }

      // Drop foreign key first
      const table = await queryRunner.getTable('users');
      if (table) {
        const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf('channelId') !== -1);
        if (foreignKey) {
          console.log('Dropping foreign key for channelId column');
          await queryRunner.dropForeignKey('users', foreignKey);
        }
      }

      // Check if channelId column exists
      const columns = await queryRunner.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'channelId'
      `);

      if (columns.length > 0) {
        console.log('Dropping channelId column from users table');
        // Then drop the column
        await queryRunner.dropColumn('users', 'channelId');
      } else {
        console.log('channelId column does not exist in users table, nothing to drop');
      }
      
      console.log('AddChannelIdToUsers migration reversion completed successfully');
    } catch (error) {
      console.error('Error in reverting AddChannelIdToUsers migration:', error);
      throw error;
    }
  }
} 