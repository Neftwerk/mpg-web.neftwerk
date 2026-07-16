/**
 * Discovery modules — public curated Discover sections.
 */

import { API_ENDPOINTS } from "./api";
import { apiFetch } from "./auth-service";
import type { ArtworkItem } from "./gallery-service";

export interface PublicDiscoveryModule {
  id: string;
  title: string;
  text: string;
  curatorName: string;
  artworkIds: string[];
  published: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  artworks: ArtworkItem[];
}

type Envelope<T> = { success?: boolean; data?: T; message?: string };

function unwrapPublicModules(payload: unknown): PublicDiscoveryModule[] {
  if (!payload || typeof payload !== "object") return [];
  const envelope = payload as Envelope<{ modules?: PublicDiscoveryModule[] }>;
  return Array.isArray(envelope.data?.modules) ? envelope.data.modules : [];
}

export async function fetchPublicDiscoveryModules(): Promise<PublicDiscoveryModule[]> {
  const result = await apiFetch(API_ENDPOINTS.PUBLIC.DISCOVERY);
  if (!result.ok) {
    throw new Error(result.message || "Could not load discovery modules");
  }
  return unwrapPublicModules(result.data);
}
