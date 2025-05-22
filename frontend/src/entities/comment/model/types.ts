export interface Comment {
  id: string;
  content: string;
  parentId: string | null;
  videoId: string;
  userId: string;
  username: string;
  userAvatarUrl: string | null;
  likesCount: number;
  dislikesCount: number;
  repliesCount: number;
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