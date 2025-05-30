import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSubscriptionsTable1625847500000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if the subscriptions table already exists
    const tableExists = await queryRunner.hasTable('subscriptions');
    if (!tableExists) {
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
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Check if the subscriptions table exists before trying to drop it
    const tableExists = await queryRunner.hasTable('subscriptions');
    if (tableExists) {
      await queryRunner.query(`DROP INDEX "IDX_subscriptions_channel_id"`);
      await queryRunner.query(`DROP INDEX "IDX_subscriptions_subscriber_id"`);
      await queryRunner.query(`DROP TABLE "subscriptions"`);
    }
  }
} 