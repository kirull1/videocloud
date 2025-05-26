import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCountColumnsToComments1716650700000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if likes_count column exists
    const likesCountExists = await queryRunner.hasColumn('comments', 'likes_count');
    if (!likesCountExists) {
      await queryRunner.addColumn(
        'comments',
        new TableColumn({
          name: 'likes_count',
          type: 'int',
          default: 0,
          isNullable: false,
        }),
      );
    }

    // Check if dislikes_count column exists
    const dislikesCountExists = await queryRunner.hasColumn('comments', 'dislikes_count');
    if (!dislikesCountExists) {
      await queryRunner.addColumn(
        'comments',
        new TableColumn({
          name: 'dislikes_count',
          type: 'int',
          default: 0,
          isNullable: false,
        }),
      );
    }

    // Check if replies_count column exists
    const repliesCountExists = await queryRunner.hasColumn('comments', 'replies_count');
    if (!repliesCountExists) {
      await queryRunner.addColumn(
        'comments',
        new TableColumn({
          name: 'replies_count',
          type: 'int',
          default: 0,
          isNullable: false,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop columns if they exist
    const likesCountExists = await queryRunner.hasColumn('comments', 'likes_count');
    if (likesCountExists) {
      await queryRunner.dropColumn('comments', 'likes_count');
    }

    const dislikesCountExists = await queryRunner.hasColumn('comments', 'dislikes_count');
    if (dislikesCountExists) {
      await queryRunner.dropColumn('comments', 'dislikes_count');
    }

    const repliesCountExists = await queryRunner.hasColumn('comments', 'replies_count');
    if (repliesCountExists) {
      await queryRunner.dropColumn('comments', 'replies_count');
    }
  }
}