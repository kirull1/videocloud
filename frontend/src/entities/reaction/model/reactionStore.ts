import { makeAutoObservable, runInAction } from 'mobx';
import { reactionApi } from '../api/reactionApi';
import type { CreateReactionRequest, Reaction, VideoReactions } from './types';
import { ReactionType } from './types';

class ReactionStore {
  videoReactions: Map<string, VideoReactions> = new Map();
  userReactions: Reaction[] = [];
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async createReaction(reaction: CreateReactionRequest): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const createdReaction = await reactionApi.createReaction(reaction);
      
      runInAction(() => {
        // Update video reactions
        const videoId = reaction.videoId;
        const currentReactions = this.videoReactions.get(videoId);
        
        if (currentReactions) {
          const updatedReactions = { ...currentReactions };
          
          // If user already had a reaction, decrement the previous count
          if (updatedReactions.userReaction) {
            if (updatedReactions.userReaction === ReactionType.LIKE) {
              updatedReactions.likesCount -= 1;
            } else {
              updatedReactions.dislikesCount -= 1;
            }
          }
          
          // Increment the new reaction count
          if (reaction.type === ReactionType.LIKE) {
            updatedReactions.likesCount += 1;
          } else {
            updatedReactions.dislikesCount += 1;
          }
          
          updatedReactions.userReaction = reaction.type;
          this.videoReactions.set(videoId, updatedReactions);
        }
        
        // Update user reactions
        const existingIndex = this.userReactions.findIndex(
          (r) => r.videoId === reaction.videoId
        );
        
        if (existingIndex !== -1) {
          this.userReactions[existingIndex] = createdReaction;
        } else {
          this.userReactions.push(createdReaction);
        }
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Failed to create reaction';
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async deleteReaction(videoId: string): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      await reactionApi.deleteReaction(videoId);
      
      runInAction(() => {
        // Update video reactions
        const currentReactions = this.videoReactions.get(videoId);
        
        if (currentReactions) {
          const updatedReactions = { ...currentReactions };
          
          // Decrement the reaction count
          if (updatedReactions.userReaction === ReactionType.LIKE) {
            updatedReactions.likesCount -= 1;
          } else if (updatedReactions.userReaction === ReactionType.DISLIKE) {
            updatedReactions.dislikesCount -= 1;
          }
          
          updatedReactions.userReaction = undefined;
          this.videoReactions.set(videoId, updatedReactions);
        }
        
        // Remove from user reactions
        this.userReactions = this.userReactions.filter(
          (reaction) => reaction.videoId !== videoId
        );
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Failed to delete reaction';
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async getVideoReactions(videoId: string): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const reactions = await reactionApi.getVideoReactions(videoId);
      
      runInAction(() => {
        this.videoReactions.set(videoId, reactions);
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Failed to get video reactions';
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async getUserReactions(): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const reactions = await reactionApi.getUserReactions();
      
      runInAction(() => {
        this.userReactions = reactions;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Failed to get user reactions';
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  toggleReaction(videoId: string, type: ReactionType): void {
    const currentReactions = this.videoReactions.get(videoId);
    
    if (!currentReactions) {
      return;
    }
    
    // If user hasn't reacted yet, create a new reaction
    if (!currentReactions.userReaction) {
      this.createReaction({ videoId, type });
      return;
    }
    
    // If user clicked the same reaction type, remove the reaction
    if (currentReactions.userReaction === type) {
      this.deleteReaction(videoId);
      return;
    }
    
    // If user clicked a different reaction type, update the reaction
    this.createReaction({ videoId, type });
  }

  getReactionsForVideo(videoId: string): VideoReactions | undefined {
    return this.videoReactions.get(videoId);
  }

  clearError(): void {
    this.error = null;
  }
}

export const reactionStore = new ReactionStore();