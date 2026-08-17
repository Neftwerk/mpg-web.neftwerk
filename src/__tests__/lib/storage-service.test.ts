import { describe, it, expect } from "vitest";
import { extractS3KeyFromUrl, isPresignedMediaUrl } from "@/lib/storage-service";

describe("extractS3KeyFromUrl", () => {
  it("extracts key from standard S3 URL", () => {
    const url = "https://mybucket.s3.us-east-1.amazonaws.com/uploads/photo.jpg";
    expect(extractS3KeyFromUrl(url)).toBe("uploads/photo.jpg");
  });

  it("extracts key from s3.amazonaws.com URL", () => {
    const url = "https://s3.amazonaws.com/mybucket/images/art.png";
    expect(extractS3KeyFromUrl(url)).toBe("mybucket/images/art.png");
  });

  it("decodes URL-encoded key", () => {
    const url = "https://mybucket.s3.us-east-1.amazonaws.com/uploads/my%20file.jpg";
    expect(extractS3KeyFromUrl(url)).toBe("uploads/my file.jpg");
  });

  it("returns null for non-S3 URL", () => {
    expect(extractS3KeyFromUrl("https://cdn.example.com/image.jpg")).toBeNull();
  });

  it("returns null for invalid URL", () => {
    expect(extractS3KeyFromUrl("not a url")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(extractS3KeyFromUrl("")).toBeNull();
  });
});

describe("isPresignedMediaUrl", () => {
  it("returns true for URL with X-Amz-Signature param", () => {
    const url =
      "https://bucket.s3.amazonaws.com/key?X-Amz-Signature=abc123&X-Amz-Date=20260101";
    expect(isPresignedMediaUrl(url)).toBe(true);
  });

  it("returns true for URL with dev-mode=true param", () => {
    const url = "https://localhost:3000/images/art.jpg?dev-mode=true";
    expect(isPresignedMediaUrl(url)).toBe(true);
  });

  it("returns false for regular URL without presign params", () => {
    expect(isPresignedMediaUrl("https://cdn.example.com/image.jpg")).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isPresignedMediaUrl(undefined)).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isPresignedMediaUrl("")).toBe(false);
  });

  it("returns false for invalid URL string", () => {
    expect(isPresignedMediaUrl("not a url")).toBe(false);
  });
});
