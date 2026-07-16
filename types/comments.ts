export type PostComment = {
  id: string;
  postId: string;
  authorId: string;
  body: string;
  createdAt: string;
  authorHandle: string;
  authorName: string;
  authorAvatar: string | null;
};
