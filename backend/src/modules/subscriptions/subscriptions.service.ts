import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '../../entities/subscription.entity';
import { Channel } from '../../entities/channel.entity';
import { User } from '../../entities/user.entity';

/**
 * Service for managing channel subscriptions
 */
@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionsRepository: Repository<Subscription>,
    @InjectRepository(Channel)
    private channelsRepository: Repository<Channel>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Subscribe a user to a channel
   * @param subscriberId The ID of the user subscribing
   * @param channelId The ID of the channel being subscribed to
   */
  async subscribe(subscriberId: string, channelId: string): Promise<void> {
    // Check if channel exists
    const channel = await this.channelsRepository.findOne({
      where: { id: channelId },
    });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    // Check if user is trying to subscribe to their own channel
    if (channel.userId === subscriberId) {
      throw new ConflictException('Cannot subscribe to your own channel');
    }

    // Check if subscription already exists
    const existingSubscription = await this.subscriptionsRepository.findOne({
      where: {
        subscriberId,
        channelId,
      },
    });

    if (existingSubscription) {
      throw new ConflictException('Already subscribed to this channel');
    }

    // Create subscription
    await this.subscriptionsRepository.save({
      subscriberId,
      channelId,
    });

    // Increment subscriber count in channel
    await this.channelsRepository.increment({ id: channelId }, 'subscriberCount', 1);
  }

  /**
   * Unsubscribe a user from a channel
   * @param subscriberId The ID of the user unsubscribing
   * @param channelId The ID of the channel being unsubscribed from
   */
  async unsubscribe(subscriberId: string, channelId: string): Promise<void> {
    // Check if channel exists
    const channel = await this.channelsRepository.findOne({
      where: { id: channelId },
    });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    // Check if subscription exists
    const subscription = await this.subscriptionsRepository.findOne({
      where: {
        subscriberId,
        channelId,
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Remove subscription
    await this.subscriptionsRepository.remove(subscription);

    // Decrement subscriber count in channel
    if (channel.subscriberCount > 0) {
      await this.channelsRepository.decrement({ id: channelId }, 'subscriberCount', 1);
    }
  }

  /**
   * Check if a user is subscribed to a channel
   * @param subscriberId The ID of the user
   * @param channelId The ID of the channel
   * @returns Boolean indicating whether the user is subscribed
   */
  async isSubscribed(subscriberId: string, channelId: string): Promise<boolean> {
    const subscription = await this.subscriptionsRepository.findOne({
      where: {
        subscriberId,
        channelId,
      },
    });

    return !!subscription;
  }

  /**
   * Get the number of subscribers for a channel
   * @param channelId The ID of the channel
   * @returns The subscriber count
   */
  async getSubscriberCount(channelId: string): Promise<number> {
    const channel = await this.channelsRepository.findOne({
      where: { id: channelId },
    });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    return channel.subscriberCount;
  }

  /**
   * Get all channels a user is subscribed to
   * @param subscriberId The ID of the user
   * @returns Array of subscription entities with channel relations
   */
  async getSubscriptions(subscriberId: string): Promise<Subscription[]> {
    return this.subscriptionsRepository.find({
      where: { subscriberId },
      relations: ['channel'],
    });
  }

  /**
   * Get all subscribers of a channel
   * @param channelId The ID of the channel
   * @returns Array of subscription entities with subscriber relations
   */
  async getSubscribers(channelId: string): Promise<Subscription[]> {
    return this.subscriptionsRepository.find({
      where: { channelId },
      relations: ['subscriber'],
    });
  }
} 