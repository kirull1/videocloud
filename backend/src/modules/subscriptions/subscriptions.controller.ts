import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../modules/auth/decorators/current-user.decorator';
import { SubscriptionsService } from './subscriptions.service';

/**
 * Controller for managing channel subscriptions
 */
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  /**
   * Subscribe to a channel
   * @param user The authenticated user
   * @param channelId The ID of the channel to subscribe to
   * @returns Success status and message
   */
  @Post(':channelId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async subscribe(
    @CurrentUser() user: any,
    @Param('channelId') channelId: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.subscriptionsService.subscribe(user.id, channelId);
    return {
      success: true,
      message: 'Successfully subscribed to channel',
    };
  }

  /**
   * Unsubscribe from a channel
   * @param user The authenticated user
   * @param channelId The ID of the channel to unsubscribe from
   * @returns Success status and message
   */
  @Delete(':channelId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async unsubscribe(
    @CurrentUser() user: any,
    @Param('channelId') channelId: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.subscriptionsService.unsubscribe(user.id, channelId);
    return {
      success: true,
      message: 'Successfully unsubscribed from channel',
    };
  }

  /**
   * Check if the authenticated user is subscribed to a channel
   * @param user The authenticated user
   * @param channelId The ID of the channel to check
   * @returns Subscription status
   */
  @Get(':channelId/status')
  @UseGuards(JwtAuthGuard)
  async isSubscribed(
    @CurrentUser() user: any,
    @Param('channelId') channelId: string,
  ): Promise<{ isSubscribed: boolean }> {
    const isSubscribed = await this.subscriptionsService.isSubscribed(
      user.id,
      channelId,
    );
    return { isSubscribed };
  }

  /**
   * Get the number of subscribers for a channel
   * @param channelId The ID of the channel
   * @returns Subscriber count
   */
  @Get(':channelId/count')
  async getSubscriberCount(
    @Param('channelId') channelId: string,
  ): Promise<{ count: number }> {
    const count = await this.subscriptionsService.getSubscriberCount(channelId);
    return { count };
  }

  /**
   * Get all channels the authenticated user is subscribed to
   * @param user The authenticated user
   * @returns List of subscribed channels
   */
  @Get('user/list')
  @UseGuards(JwtAuthGuard)
  async getSubscriptions(
    @CurrentUser() user: any,
  ) {
    const subscriptions = await this.subscriptionsService.getSubscriptions(user.id);
    return {
      items: subscriptions.map(sub => ({
        id: sub.id,
        channelId: sub.channelId,
        channelName: sub.channel?.name || 'Unknown Channel',
        subscribedAt: sub.createdAt,
      })),
    };
  }
} 