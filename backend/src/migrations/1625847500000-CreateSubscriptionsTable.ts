import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSubscriptionsTable1625847500000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    try {
      // Check if the users table exists
      const usersTableExists = await queryRunner.hasTable('users');
      if (!usersTableExists) {
        console.log('Users table does not exist, skipping migration');
        return;
      }

      // Check if the channels table exists
      const channelsTableExists = await queryRunner.hasTable('channels');
      if (!channelsTableExists) {
        console.log('Channels table does not exist, skipping migration');
        return;
      }

      // Check if the subscriptions table already exists
      const tableExists = await queryRunner.hasTable('subscriptions');
      if (tableExists) {
        console.log('Subscriptions table already exists, skipping creation');
        return;
      }

      console.log('Creating subscriptions table');
      
      // Check if uuid-ossp extension is available
      await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

      await queryRunner.query(`
        CREATE TABLE "subscriptions" (
          "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
          "subscriber_id" uuid NOT NULL,
          "channel_id" uuid NOT NULL,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "UQ_subscriber_channel" UNIQUE ("subscriber_id", "channel_id"),
          CONSTRAINT "FK_subscriptions_subscriber" FOREIGN KEY ("subscriber_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "FK_subscriptions_channel" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE
        )
      `);

      // Add index for faster lookups
      await queryRunner.query(`
        CREATE INDEX "IDX_subscriptions_subscriber_id" ON "subscriptions" ("subscriber_id")
      `);
      
      await queryRunner.query(`
        CREATE INDEX "IDX_subscriptions_channel_id" ON "subscriptions" ("channel_id")
      `);
      
      console.log('CreateSubscriptionsTable migration completed successfully');
    } catch (error) {
      console.error('Error in CreateSubscriptionsTable migration:', error);
      throw error;
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    try {
      // Check if the subscriptions table exists before trying to drop it
      const tableExists = await queryRunner.hasTable('subscriptions');
      if (!tableExists) {
        console.log('Subscriptions table does not exist, nothing to drop');
        return;
      }

      console.log('Dropping subscriptions table');
      
      // Check if indexes exist before dropping
      const indexChannelExists = await this.indexExists(queryRunner, 'IDX_subscriptions_channel_id');
      if (indexChannelExists) {
        await queryRunner.query(`DROP INDEX "IDX_subscriptions_channel_id"`);
      }
      
      const indexSubscriberExists = await this.indexExists(queryRunner, 'IDX_subscriptions_subscriber_id');
      if (indexSubscriberExists) {
        await queryRunner.query(`DROP INDEX "IDX_subscriptions_subscriber_id"`);
      }
      
      await queryRunner.query(`DROP TABLE "subscriptions"`);
      
      console.log('CreateSubscriptionsTable migration reversion completed successfully');
    } catch (error) {
      console.error('Error in reverting CreateSubscriptionsTable migration:', error);
      throw error;
    }
  }
  
  private async indexExists(queryRunner: QueryRunner, indexName: string): Promise<boolean> {
    const result = await queryRunner.query(`
      SELECT indexname FROM pg_indexes WHERE indexname = '${indexName}'
    `);
    return result.length > 0;
  }
} 