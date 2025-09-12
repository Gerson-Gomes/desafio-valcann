import { NextResponse } from "next/server";

const API_BASE = "https://api.nasa.gov/mars-photos/api/v1/rovers";
const CACHE_TTL_SECONDS = 300; // 5 minutos (ajuste conforme quiser)

// Simple in-memory cache: Map<key, { expiresAt: number, photos: Array }>
const cache = new Map();

function makeCacheKey(rover, camera, earth_date) {
  // ordenado e previsível
  return `r:${rover || ""}|c:${camera || ""}|d:${earth_date || ""}`;
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const rover = url.searchParams.get("rover");
    if (!rover) {
      return NextResponse.json({ error: "rover is required" }, { status: 400 });
    }
    const camera = url.searchParams.get("camera");
    const earth_date = url.searchParams.get("earth_date");
    const apiKey = process.env.NASA_API_KEY || "DEMO_KEY";

    const cacheKey = makeCacheKey(rover, camera, earth_date);
    const now = Date.now();

    // return cached if still valid
    const cached = cache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      // adiciona headers que permitem CDN/browser cache
      return NextResponse.json(
        { photos: cached.photos, cached: true },
        {
          status: 200,
          headers: {
            "Cache-Control": `public, max-age=60, s-maxage=${CACHE_TTL_SECONDS}, stale-while-revalidate=30`,
          },
        }
      );
    }

    // monta params
    const params = new URLSearchParams();
    params.set("api_key", apiKey);
    if (earth_date) params.set("earth_date", earth_date);
    if (camera) params.set("camera", camera);

    const nasaUrl = `${API_BASE}/${encodeURIComponent(rover)}/photos?${params.toString()}`;

    const res = await fetch(nasaUrl);
    if (!res.ok) {
      const txt = await res.text();
      return NextResponse.json({ error: txt }, { status: res.status });
    }
    const json = await res.json();
    const photos = Array.isArray(json.photos) ? json.photos : [];

    // store cache
    cache.set(cacheKey, { photos, expiresAt: now + CACHE_TTL_SECONDS * 1000 });

    return NextResponse.json(
      { photos, cached: false },
      {
        status: 200,
        headers: {
          "Cache-Control": `public, max-age=60, s-maxage=${CACHE_TTL_SECONDS}, stale-while-revalidate=30`,
        },
      }
    );
  } catch (err) {
    console.error("api/mars-photos error:", err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}