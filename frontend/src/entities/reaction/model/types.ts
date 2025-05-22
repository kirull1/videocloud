export enum ReactionType {
  LIKE = 'like',
  DISLIKE = 'dislike',
}

export interface Reaction {
  id: string;
  type: ReactionType;
  videoId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface VideoReactions {
  videoId: string;
  likesCount: number;
  dislikesCount: number;
  userReaction?: ReactionType;
}

export interface CreateReactionRequest {
  type: ReactionType;
  videoId: string;
}