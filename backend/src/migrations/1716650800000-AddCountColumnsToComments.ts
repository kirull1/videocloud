import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCountColumnsToComments1716650800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if the comments table exists
    const tableExists = await queryRunner.hasTable('comments');
    if (!tableExists) {
      return;
    }

    // Check if likes_count column already exists
    const likesCountExists = await this.columnExists(queryRunner, 'comments', 'likes_count');
    if (!likesCountExists) {
      await queryRunner.addColumn(
        'comments',
        new TableColumn({
          name: 'likes_count',
          type: 'integer',
          default: 0,
          isNullable: false,
        }),
      );
    }

    // Check if dislikes_count column already exists
    const dislikesCountExists = await this.columnExists(queryRunner, 'comments', 'dislikes_count');
    if (!dislikesCountExists) {
      await queryRunner.addColumn(
        'comments',
        new TableColumn({
          name: 'dislikes_count',
          type: 'integer',
          default: 0,
          isNullable: false,
        }),
      );
    }

    // Check if replies_count column already exists
    const repliesCountExists = await this.columnExists(queryRunner, 'comments', 'replies_count');
    if (!repliesCountExists) {
      await queryRunner.addColumn(
        'comments',
        new TableColumn({
          name: 'replies_count',
          type: 'integer',
          default: 0,
          isNullable: false,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Check if the comments table exists
    const tableExists = await queryRunner.hasTable('comments');
    if (!tableExists) {
      return;
    }

    // Drop replies_count column if it exists
    const repliesCountExists = await this.columnExists(queryRunner, 'comments', 'replies_count');
    if (repliesCountExists) {
      await queryRunner.dropColumn('comments', 'replies_count');
    }

    // Drop dislikes_count column if it exists
    const dislikesCountExists = await this.columnExists(queryRunner, 'comments', 'dislikes_count');
    if (dislikesCountExists) {
      await queryRunner.dropColumn('comments', 'dislikes_count');
    }

    // Drop likes_count column if it exists
    const likesCountExists = await this.columnExists(queryRunner, 'comments', 'likes_count');
    if (likesCountExists) {
      await queryRunner.dropColumn('comments', 'likes_count');
    }
  }

  private async columnExists(queryRunner: QueryRunner, table: string, column: string): Promise<boolean> {
    const columns = await queryRunner.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = '${table}' AND column_name = '${column}'
    `);
    return columns.length > 0;
  }
} 