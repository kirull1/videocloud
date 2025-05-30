import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from '../../entities/subscription.entity';
import { Channel } from '../../entities/channel.entity';
import { User } from '../../entities/user.entity';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';

/**
 * Module for handling channel subscriptions
 * Allows users to subscribe/unsubscribe to channels and check subscription status
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription, Channel, User]),
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {} 