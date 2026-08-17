import { describe, it, expect, beforeEach } from "vitest";

// We need to set env before importing the module
const MOCK_BASE_URL = "https://api.test.com";
process.env.NEXT_PUBLIC_API_BASE_URL = MOCK_BASE_URL;

// Dynamic import so the env var is picked up
const { API_ENDPOINTS, API_BASE_URL } = await import("@/lib/api");

describe("API_BASE_URL", () => {
  it("reads from NEXT_PUBLIC_API_BASE_URL env var", () => {
    expect(API_BASE_URL).toBe(MOCK_BASE_URL);
  });
});

describe("API_ENDPOINTS", () => {
  describe("AUTH", () => {
    it("has correct REGISTER endpoint", () => {
      expect(API_ENDPOINTS.AUTH.REGISTER).toBe(`${MOCK_BASE_URL}/api/auth/register`);
    });

    it("has correct LOGIN_OTP_REQUEST endpoint", () => {
      expect(API_ENDPOINTS.AUTH.LOGIN_OTP_REQUEST).toBe(`${MOCK_BASE_URL}/api/auth/login/otp`);
    });

    it("has correct LOGIN_OTP_VERIFY endpoint", () => {
      expect(API_ENDPOINTS.AUTH.LOGIN_OTP_VERIFY).toBe(`${MOCK_BASE_URL}/api/auth/login/otp/verify`);
    });

    it("has correct REFRESH_TOKEN endpoint", () => {
      expect(API_ENDPOINTS.AUTH.REFRESH_TOKEN).toBe(`${MOCK_BASE_URL}/api/auth/refresh`);
    });

    it("has correct PROFILE endpoint", () => {
      expect(API_ENDPOINTS.AUTH.PROFILE).toBe(`${MOCK_BASE_URL}/api/auth/profile`);
    });

    it("has correct DELETE_ACCOUNT endpoint", () => {
      expect(API_ENDPOINTS.AUTH.DELETE_ACCOUNT).toBe(`${MOCK_BASE_URL}/api/auth/delete-self`);
    });
  });

  describe("FORUM dynamic endpoints", () => {
    it("constructs ADMIN_POST url with id", () => {
      expect(API_ENDPOINTS.FORUM.ADMIN_POST("abc123")).toBe(
        `${MOCK_BASE_URL}/api/forum/admin/posts/abc123`
      );
    });

    it("constructs POST_BY_SLUG url with slug", () => {
      expect(API_ENDPOINTS.FORUM.POST_BY_SLUG("my-post")).toBe(
        `${MOCK_BASE_URL}/api/forum/posts/my-post`
      );
    });

    it("constructs POST_COMMENTS url with postId", () => {
      expect(API_ENDPOINTS.FORUM.POST_COMMENTS("post1")).toBe(
        `${MOCK_BASE_URL}/api/forum/posts/post1/comments`
      );
    });

    it("constructs REACT_POST url", () => {
      expect(API_ENDPOINTS.FORUM.REACT_POST("post1")).toBe(
        `${MOCK_BASE_URL}/api/forum/posts/post1/react`
      );
    });
  });

  describe("ENQUIRIES dynamic endpoints", () => {
    it("constructs DETAIL url", () => {
      expect(API_ENDPOINTS.ENQUIRIES.DETAIL("enq1")).toBe(
        `${MOCK_BASE_URL}/api/enquiries/enq1`
      );
    });

    it("constructs MESSAGES url", () => {
      expect(API_ENDPOINTS.ENQUIRIES.MESSAGES("enq1")).toBe(
        `${MOCK_BASE_URL}/api/enquiries/enq1/messages`
      );
    });

    it("constructs READ url", () => {
      expect(API_ENDPOINTS.ENQUIRIES.READ("enq1")).toBe(
        `${MOCK_BASE_URL}/api/enquiries/enq1/read`
      );
    });
  });

  describe("PUBLIC dynamic endpoints", () => {
    it("constructs GALLERY url", () => {
      expect(API_ENDPOINTS.PUBLIC.GALLERY("g1")).toBe(
        `${MOCK_BASE_URL}/api/public/galleries/g1`
      );
    });

    it("constructs GALLERY_ARTWORKS url", () => {
      expect(API_ENDPOINTS.PUBLIC.GALLERY_ARTWORKS("g1")).toBe(
        `${MOCK_BASE_URL}/api/public/galleries/g1/artworks`
      );
    });

    it("constructs ARTWORK url", () => {
      expect(API_ENDPOINTS.PUBLIC.ARTWORK("a1")).toBe(
        `${MOCK_BASE_URL}/api/public/artworks/a1`
      );
    });

    it("constructs COLLECTION_ARTWORKS url", () => {
      expect(API_ENDPOINTS.PUBLIC.COLLECTION_ARTWORKS("c1")).toBe(
        `${MOCK_BASE_URL}/api/public/collections/c1/artworks`
      );
    });
  });

  describe("SAVED dynamic endpoints", () => {
    it("constructs SAVE url", () => {
      expect(API_ENDPOINTS.SAVED.SAVE("art1")).toBe(
        `${MOCK_BASE_URL}/api/saved/art1`
      );
    });

    it("constructs UNSAVE url", () => {
      expect(API_ENDPOINTS.SAVED.UNSAVE("art1")).toBe(
        `${MOCK_BASE_URL}/api/saved/art1`
      );
    });
  });

  describe("NOTIFICATIONS dynamic endpoints", () => {
    it("constructs READ url", () => {
      expect(API_ENDPOINTS.NOTIFICATIONS.READ("n1")).toBe(
        `${MOCK_BASE_URL}/api/notifications/n1/read`
      );
    });

    it("constructs DELETE url", () => {
      expect(API_ENDPOINTS.NOTIFICATIONS.DELETE("n1")).toBe(
        `${MOCK_BASE_URL}/api/notifications/n1`
      );
    });
  });

  describe("SALES dynamic endpoints", () => {
    it("constructs MINT_PREP url", () => {
      expect(API_ENDPOINTS.SALES.MINT_PREP("s1")).toBe(
        `${MOCK_BASE_URL}/api/sales/s1/mint-prep`
      );
    });

    it("constructs MINT_RELAY url", () => {
      expect(API_ENDPOINTS.SALES.MINT_RELAY("s1")).toBe(
        `${MOCK_BASE_URL}/api/sales/s1/mint-relay`
      );
    });

    it("constructs MINT_SUBMIT url", () => {
      expect(API_ENDPOINTS.SALES.MINT_SUBMIT("s1")).toBe(
        `${MOCK_BASE_URL}/api/sales/s1/mint-submit`
      );
    });
  });

  describe("STORAGE dynamic endpoints", () => {
    it("constructs PRESIGN url with simple key", () => {
      expect(API_ENDPOINTS.STORAGE.PRESIGN("images/photo.jpg")).toBe(
        `${MOCK_BASE_URL}/api/storage/presign/images/photo.jpg`
      );
    });

    it("encodes special characters in PRESIGN key", () => {
      const url = API_ENDPOINTS.STORAGE.PRESIGN("uploads/my file (1).jpg");
      expect(url).toContain("my%20file%20(1).jpg");
    });
  });
});
