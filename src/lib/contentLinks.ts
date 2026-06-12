import type { ContentPlatform } from '@/types/campaign.types';

export const PLATFORM_LABELS: Record<ContentPlatform, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  gdrive: 'Google Drive',
  other: 'Video',
};

const VIDEO_FILE_RE = /\.(mp4|webm|mov|m4v|ogv|ogg)(\?|#|$)/i;

/**
 * Detect the platform from a pasted content URL. Known socials and Google
 * Drive are recognized explicitly; any other valid http(s) URL is accepted as
 * 'other' (direct video files and cloud-storage links). Returns null only for
 * strings that aren't URLs at all.
 */
export function detectPlatform(url: string): ContentPlatform | null {
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return null;
  }
  if (!/^https?:$/.test(parsed.protocol)) return null;

  const host = parsed.hostname.toLowerCase();
  if (host === 'instagram.com' || host.endsWith('.instagram.com')) return 'instagram';
  if (host === 'tiktok.com' || host.endsWith('.tiktok.com')) return 'tiktok';
  if (host === 'youtu.be' || host === 'youtube.com' || host.endsWith('.youtube.com')) {
    return 'youtube';
  }
  if (host === 'drive.google.com' || host === 'docs.google.com') return 'gdrive';
  return 'other';
}

/**
 * Build an iframe embed URL so the video plays inside the CRM. Socials only
 * allow playback through their embed endpoints (public posts only); Drive
 * files play via the Drive preview iframe (must be shared "anyone with link").
 */
export function getEmbedUrl(url: string, platform: ContentPlatform): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return null;
  }

  if (platform === 'instagram') {
    const match = parsed.pathname.match(/\/(reel|reels|p|tv)\/([A-Za-z0-9_-]+)/);
    if (match) {
      const kind = match[1] === 'reels' ? 'reel' : match[1];
      return `https://www.instagram.com/${kind}/${match[2]}/embed/`;
    }
  }

  if (platform === 'tiktok') {
    const match = parsed.pathname.match(/\/video\/(\d+)/);
    if (match) return `https://www.tiktok.com/embed/v2/${match[1]}`;
  }

  if (platform === 'youtube') {
    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.split('/').filter(Boolean)[0];
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    const shorts = parsed.pathname.match(/\/shorts\/([A-Za-z0-9_-]+)/);
    if (shorts) return `https://www.youtube.com/embed/${shorts[1]}`;
    const videoId = parsed.searchParams.get('v');
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  }

  if (platform === 'gdrive') {
    const fileId =
      parsed.pathname.match(/\/file\/d\/([A-Za-z0-9_-]+)/)?.[1] ?? parsed.searchParams.get('id');
    if (fileId) return `https://drive.google.com/file/d/${fileId}/preview`;
  }

  return null;
}

/**
 * Resolve a URL the browser can play natively in a <video> element: direct
 * video files and cloud links convertible to one (e.g. Dropbox share links).
 */
export function getDirectVideoUrl(url: string, platform: ContentPlatform): string | null {
  if (platform !== 'other') return null;
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return null;
  }

  const host = parsed.hostname.toLowerCase();
  if (host === 'www.dropbox.com' || host === 'dropbox.com') {
    parsed.hostname = 'dl.dropboxusercontent.com';
    parsed.searchParams.delete('dl');
    return parsed.toString();
  }

  if (VIDEO_FILE_RE.test(parsed.pathname + parsed.search)) return parsed.toString();
  return null;
}

/** Canonical form used to detect duplicate submissions of the same link. */
export function normalizeContentUrl(url: string): string {
  try {
    const parsed = new URL(url.trim());
    const path = parsed.pathname.replace(/\/+$/, '');
    return `${parsed.hostname.toLowerCase().replace(/^www\./, '')}${path}`;
  } catch {
    return url.trim().toLowerCase();
  }
}
