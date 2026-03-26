import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
};

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') || '';
  const limitRaw = request.nextUrl.searchParams.get('limit') || '5';
  const limit = Math.min(10, Math.max(1, parseInt(limitRaw, 10) || 5));

  if (q.trim().length < 2) {
    return NextResponse.json({ results: [], error: 'Query too short' }, { status: 400 });
  }

  try {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('format', 'json');
    url.searchParams.set('q', q);
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('addressdetails', '1');

    const resp = await fetch(url.toString(), {
      headers: {
        // Free service, but Nominatim requires a descriptive User-Agent.
        // If you have an email/contact, add it here.
        'User-Agent': 'siz.land/1.0 (support@siz.land)',
      },
    });

    if (!resp.ok) {
      return NextResponse.json(
        { error: `Geocode provider error (${resp.status})` },
        { status: 502 }
      );
    }

    const data = (await resp.json()) as NominatimResult[];
    return NextResponse.json({ results: Array.isArray(data) ? data : [] });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Geocode search failed' },
      { status: 500 }
    );
  }
}

