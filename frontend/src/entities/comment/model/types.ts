export interface Comment {
  id: string;
  content: string;
  parentId: string | null;
  videoId: string;
  userId: string;
  userAvatarUrl: string | null;
  likesCount: number;
  dislikesCount: number;
  repliesCount: number;
  user: {
      id: string;
      username: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  content: string;
  videoId: string;
  parentId?: string;
}

export interface UpdateCommentRequest {
  content: string;
}