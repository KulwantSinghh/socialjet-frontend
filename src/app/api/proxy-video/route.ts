import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_DOMAINS = [
  'cdninstagram.com',
  'instagram.com',
  'fbcdn.net',
  'tiktokcdn.com',
  'tiktok.com',
  'musical.ly',
];

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) return new NextResponse('Missing url', { status: 400 });

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return new NextResponse('Invalid url', { status: 400 });
  }

  const isAllowed = ALLOWED_DOMAINS.some((d) => parsed.hostname.endsWith(d));
  if (!isAllowed) return new NextResponse('Domain not allowed', { status: 403 });

  const rangeHeader = req.headers.get('range');

  try {
    const upstream = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Referer: 'https://www.instagram.com/',
        Origin: 'https://www.instagram.com',
        Accept: 'video/mp4,video/*;q=0.9,*/*;q=0.8',
        'Accept-Encoding': 'identity',
        ...(rangeHeader ? { Range: rangeHeader } : {}),
      },
    });

    if (!upstream.ok && upstream.status !== 206) {
      return new NextResponse(`Upstream ${upstream.status}`, { status: upstream.status });
    }

    const responseHeaders: Record<string, string> = {
      'Content-Type': upstream.headers.get('content-type') ?? 'video/mp4',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    };

    const cl = upstream.headers.get('content-length');
    const cr = upstream.headers.get('content-range');
    if (cl) responseHeaders['Content-Length'] = cl;
    if (cr) responseHeaders['Content-Range'] = cr;

    // Stream the body — never buffer the full video in memory
    return new Response(upstream.body, {
      status: upstream.status === 206 ? 206 : 200,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error('[proxy-video]', err);
    return new NextResponse('Proxy error', { status: 502 });
  }
}
