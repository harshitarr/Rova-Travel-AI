import { NextResponse } from "next/server";
import axios from 'axios';

async function fetchPlaceTextSearch(placeName, apiKey) {
  const query = encodeURIComponent(placeName);
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${apiKey}`;
  const resp = await axios.get(url, { timeout: 10000 });
  return resp.data;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const placeName = body?.placeName || body?.place || null;

    if (!placeName) {
      return NextResponse.json({ error: 'Missing required field: placeName' }, { status: 400 });
    }

    const key = process.env.GOOGLE_PLACE_API_KEY || process.env.GEOAPIFY_API_KEY || process.env.GOOGLE_API_KEY;
    if (!key) {
      return NextResponse.json({ error: 'Google Places API key is not set (set GOOGLE_PLACE_API_KEY)' }, { status: 500 });
    }

    const data = await fetchPlaceTextSearch(placeName, key);
    return NextResponse.json(data || {});
  } catch (e) {
    // If axios returned a response, include that payload for debugging
    const upstream = e?.response ? { status: e.response.status, data: e.response.data } : null;
    console.error('google-place-detail POST error:', e?.message || e, upstream);
    const message = e?.message || String(e);
    return NextResponse.json({ error: message, upstream }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const placeName = url.searchParams.get('placeName') || url.searchParams.get('place') || null;

    if (!placeName) {
      return NextResponse.json({ error: 'Missing required query parameter: placeName' }, { status: 400 });
    }

    const key = process.env.GOOGLE_PLACE_API_KEY || process.env.GEOAPIFY_API_KEY || process.env.GOOGLE_API_KEY;
    if (!key) {
      return NextResponse.json({ error: 'Google Places API key is not set (set GOOGLE_PLACE_API_KEY)' }, { status: 500 });
    }

    const data = await fetchPlaceTextSearch(placeName, key);
    return NextResponse.json(data || {});
  } catch (e) {
    const upstream = e?.response ? { status: e.response.status, data: e.response.data } : null;
    console.error('google-place-detail GET error:', e?.message || e, upstream);
    const message = e?.message || String(e);
    return NextResponse.json({ error: message, upstream }, { status: 500 });
  }
}