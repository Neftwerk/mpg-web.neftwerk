import { API_ENDPOINTS } from "./api";
import { apiFetch, authedFetch, getAccessToken, type ApiResponse } from "./auth-service";

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
  scheduledAt?: string;
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

export const FORUM_PUBLISHER_NAME = "Neftwerk";

type ForumAuthor = NonNullable<ForumPost["author"]>;

function unwrapApiData<T>(data: unknown): T | null {
  if (!data || typeof data !== "object") return null;
  const root = data as Record<string, unknown>;
  if ("data" in root && root.data && typeof root.data === "object") {
    return root.data as T;
  }
  return root as T;
}

function normalizeAuthor(raw: unknown): ForumAuthor | undefined {
  if (!raw || typeof raw !== "object" || !("_id" in raw)) return undefined;
  const author = raw as Record<string, unknown>;
  const fullName = typeof author.fullName === "string" ? author.fullName.trim() : "";
  if (!fullName) return undefined;

  return {
    _id: String(author._id),
    fullName,
    email: typeof author.email === "string" ? author.email : "",
    ...(typeof author.profilePicture === "string"
      ? { profilePicture: author.profilePicture }
      : {}),
  };
}

export function normalizeForumPost(post: ForumPost & { authorId?: unknown }): ForumPost {
  const { authorId, ...rest } = post;
  // Every post is attributed to the publisher regardless of which account wrote
  // it, which is why the name is overridden. The avatar is not ours to invent
  // though: the publisher account carries its own picture, and replacing the
  // whole author object threw it away, leaving the UI to draw a stand-in letter.
  const source = post.author ?? normalizeAuthor(authorId);
  return {
    ...rest,
    author: {
      _id: source?._id || "neftwerk",
      fullName: FORUM_PUBLISHER_NAME,
      email: "",
      ...(source?.profilePicture ? { profilePicture: source.profilePicture } : {}),
    },
  };
}

export function normalizeForumComment(
  comment: ForumComment & { authorId?: unknown },
): ForumComment {
  const author =
    comment.author ??
    normalizeAuthor(comment.authorId) ?? {
      _id: "",
      fullName: "Anonymous",
      email: "",
    };
  return { ...comment, author };
}

function unwrapReaction(data: unknown): ReactionResponse | null {
  const payload = unwrapApiData<ReactionResponse>(data);
  if (!payload || typeof payload.likeCount !== "number") return null;
  return {
    likeCount: payload.likeCount,
    dislikeCount: payload.dislikeCount ?? 0,
    userReaction: payload.userReaction ?? null,
  };
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
  const result = getAccessToken()
    ? await authedFetch<PostListResponse>(url, { method: "GET" })
    : await apiFetch<PostListResponse>(url, { method: "GET" });
  if (!result.ok) return result;

  const data = unwrapApiData<PostListResponse>(result.data);
  if (!data?.posts) return result;

  return {
    ok: true,
    status: result.status,
    data: {
      ...data,
      posts: data.posts.map((post) => normalizeForumPost(post)),
    },
  };
}

export async function getForumPostBySlug(slug: string): Promise<ApiResponse<{ post: ForumPost }>> {
  const url = API_ENDPOINTS.FORUM.POST_BY_SLUG(slug);
  const result = getAccessToken()
    ? await authedFetch<{ post: ForumPost }>(url, { method: "GET" })
    : await apiFetch<{ post: ForumPost }>(url, { method: "GET" });
  if (!result.ok) return result;

  const data = unwrapApiData<{ post: ForumPost }>(result.data);
  const post = data?.post ? normalizeForumPost(data.post) : null;
  return post
    ? { ok: true, status: result.status, data: { post } }
    : { ok: false, status: result.status, data: { post: {} as ForumPost }, message: "Invalid post response" };
}

// ─── Admin Post Endpoints ───

export interface CreateForumPostInput {
  title: string;
  excerpt: string;
  body: string;
  coverImage?: string | null;
  tags?: string[];
  status?: ForumPost["status"];
  scheduledAt?: string;
  isPinned?: boolean;
  commentsEnabled?: boolean;
  commentThreadMode?: "flat" | "threaded";
}

export type UpdateForumPostInput = Partial<CreateForumPostInput>;

function unwrapPostPayload(data: unknown): ForumPost | null {
  const nested = (data as { data?: { post?: ForumPost } })?.data?.post;
  if (nested?._id) return nested;
  const direct = (data as { post?: ForumPost })?.post;
  if (direct?._id) return direct;
  return null;
}

export async function getForumPostById(id: string): Promise<ApiResponse<{ post: ForumPost }>> {
  return authedFetch<{ post: ForumPost }>(API_ENDPOINTS.FORUM.ADMIN_POST(id), { method: "GET" });
}

export async function createForumPost(
  input: CreateForumPostInput
): Promise<ApiResponse<{ post: ForumPost }>> {
  const result = await authedFetch<{ post: ForumPost }>(API_ENDPOINTS.FORUM.ADMIN_CREATE_POST, {
    method: "POST",
    body: JSON.stringify(input),
  });

  if (!result.ok) return result;

  const post = unwrapPostPayload(result.data);
  return post
    ? { ok: true, status: result.status, data: { post } }
    : { ok: false, status: result.status, data: { post: {} as ForumPost }, message: "Invalid create response" };
}

export async function updateForumPost(
  id: string,
  input: UpdateForumPostInput
): Promise<ApiResponse<{ post: ForumPost }>> {
  const result = await authedFetch<{ post: ForumPost }>(API_ENDPOINTS.FORUM.ADMIN_UPDATE_POST(id), {
    method: "PUT",
    body: JSON.stringify(input),
  });

  if (!result.ok) return result;

  const post = unwrapPostPayload(result.data);
  return post
    ? { ok: true, status: result.status, data: { post } }
    : { ok: false, status: result.status, data: { post: {} as ForumPost }, message: "Invalid update response" };
}

export async function archiveForumPost(id: string): Promise<ApiResponse<unknown>> {
  return updateForumPost(id, { status: "archived" });
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
  const result = await apiFetch<CommentListResponse>(url, { method: "GET" });
  if (!result.ok) return result;

  const data = unwrapApiData<CommentListResponse>(result.data);
  if (!data?.comments) return result;

  return {
    ok: true,
    status: result.status,
    data: {
      ...data,
      comments: data.comments.map((comment) => normalizeForumComment(comment)),
    },
  };
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
  const result = await authedFetch<ReactionResponse>(API_ENDPOINTS.FORUM.REACT_POST(postId), {
    method: "POST",
    body: JSON.stringify({ reaction }),
  });
  if (!result.ok) return result;

  const data = unwrapReaction(result.data);
  return data
    ? { ok: true, status: result.status, data }
    : {
        ok: false,
        status: result.status,
        data: { likeCount: 0, dislikeCount: 0, userReaction: null },
        message: "Invalid reaction response",
      };
}

export async function reactToComment(
  commentId: string,
  reaction: "like" | "dislike"
): Promise<ApiResponse<ReactionResponse>> {
  const result = await authedFetch<ReactionResponse>(API_ENDPOINTS.FORUM.REACT_COMMENT(commentId), {
    method: "POST",
    body: JSON.stringify({ reaction }),
  });
  if (!result.ok) return result;

  const data = unwrapReaction(result.data);
  return data
    ? { ok: true, status: result.status, data }
    : {
        ok: false,
        status: result.status,
        data: { likeCount: 0, dislikeCount: 0, userReaction: null },
        message: "Invalid reaction response",
      };
}

// ─── Moderation (user-facing) ───

export async function reportComment(commentId: string, reason: string): Promise<ApiResponse<unknown>> {
  return authedFetch(API_ENDPOINTS.FORUM.REPORT_COMMENT(commentId), {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}
