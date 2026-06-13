import { API_ENDPOINTS } from "./api";
import { apiFetch, authedFetch, type ApiResponse } from "./auth-service";

// ─── Types ───

export interface ForumPost {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverImage?: string;
  tags: string[];
  status: "draft" | "scheduled" | "published" | "archived";
  isPinned: boolean;
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  viewCount: number;
  commentsEnabled: boolean;
  commentThreadMode: "flat" | "threaded";
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    _id: string;
    fullName: string;
    email: string;
    profilePicture?: string;
  };
  /** Set by backend when the current user has reacted */
  userReaction?: "like" | "dislike" | null;
}

export interface ForumComment {
  _id: string;
  postId: string;
  body: string;
  parentId?: string;
  depth: number;
  status: "pending" | "approved" | "hidden" | "deleted";
  likeCount: number;
  dislikeCount: number;
  replyCount?: number;
  reports?: number;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    _id: string;
    fullName: string;
    email: string;
    profilePicture?: string;
  };
  /** Set by backend when the current user has reacted */
  userReaction?: "like" | "dislike" | null;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PostListResponse {
  posts: ForumPost[];
  pagination: PaginationMeta;
}

export interface CommentListResponse {
  comments: ForumComment[];
  pagination: PaginationMeta;
  commentThreadMode: "flat" | "threaded";
}

export interface ReactionResponse {
  likeCount: number;
  dislikeCount: number;
  userReaction: "like" | "dislike" | null;
}

// ─── Post Endpoints ───

export interface ListPostsParams {
  page?: number;
  limit?: number;
  tags?: string;
  search?: string;
  isPinned?: boolean;
  sortBy?: "publishedAt" | "createdAt" | "likeCount" | "commentCount" | "viewCount";
  sortOrder?: "asc" | "desc";
}

export async function getForumPosts(params: ListPostsParams = {}): Promise<ApiResponse<PostListResponse>> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.tags) query.set("tags", params.tags);
  if (params.search) query.set("search", params.search);
  if (params.isPinned !== undefined) query.set("isPinned", String(params.isPinned));
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);

  const qs = query.toString();
  const url = `${API_ENDPOINTS.FORUM.LIST_POSTS}${qs ? `?${qs}` : ""}`;
  return apiFetch<PostListResponse>(url, { method: "GET" });
}

export async function getForumPostBySlug(slug: string): Promise<ApiResponse<{ post: ForumPost }>> {
  return apiFetch<{ post: ForumPost }>(API_ENDPOINTS.FORUM.POST_BY_SLUG(slug), { method: "GET" });
}

// ─── Comment Endpoints ───

export interface ListCommentsParams {
  page?: number;
  limit?: number;
  parentId?: string;
  flat?: boolean;
}

export async function getPostComments(
  postId: string,
  params: ListCommentsParams = {}
): Promise<ApiResponse<CommentListResponse>> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.parentId) query.set("parentId", params.parentId);
  if (params.flat !== undefined) query.set("flat", String(params.flat));

  const qs = query.toString();
  const url = `${API_ENDPOINTS.FORUM.POST_COMMENTS(postId)}${qs ? `?${qs}` : ""}`;
  return apiFetch<CommentListResponse>(url, { method: "GET" });
}

export async function addComment(
  postId: string,
  body: string,
  parentId?: string
): Promise<ApiResponse<{ comment: ForumComment }>> {
  return authedFetch<{ comment: ForumComment }>(API_ENDPOINTS.FORUM.ADD_COMMENT(postId), {
    method: "POST",
    body: JSON.stringify({ body, ...(parentId ? { parentId } : {}) }),
  });
}

export async function editComment(commentId: string, body: string): Promise<ApiResponse<{ comment: ForumComment }>> {
  return authedFetch<{ comment: ForumComment }>(API_ENDPOINTS.FORUM.EDIT_COMMENT(commentId), {
    method: "PUT",
    body: JSON.stringify({ body }),
  });
}

export async function deleteComment(commentId: string): Promise<ApiResponse<unknown>> {
  return authedFetch(API_ENDPOINTS.FORUM.DELETE_COMMENT(commentId), { method: "DELETE" });
}

// ─── Reaction Endpoints ───

export async function reactToPost(
  postId: string,
  reaction: "like" | "dislike"
): Promise<ApiResponse<ReactionResponse>> {
  return authedFetch<ReactionResponse>(API_ENDPOINTS.FORUM.REACT_POST(postId), {
    method: "POST",
    body: JSON.stringify({ reaction }),
  });
}

export async function reactToComment(
  commentId: string,
  reaction: "like" | "dislike"
): Promise<ApiResponse<ReactionResponse>> {
  return authedFetch<ReactionResponse>(API_ENDPOINTS.FORUM.REACT_COMMENT(commentId), {
    method: "POST",
    body: JSON.stringify({ reaction }),
  });
}

// ─── Moderation (user-facing) ───

export async function reportComment(commentId: string, reason: string): Promise<ApiResponse<unknown>> {
  return authedFetch(API_ENDPOINTS.FORUM.REPORT_COMMENT(commentId), {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}
