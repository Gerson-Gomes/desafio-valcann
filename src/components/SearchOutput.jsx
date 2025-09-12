'use client';
import React, { useEffect, useState } from "react";
import { getRoverCameras } from "@/lib/api";

export default function SearchOutput({ onclose, rover, camera, date, page = 1 }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiKey = process.env.NEXT_PUBLIC_NASA_API_KEY;

  useEffect(() => {
    if (!rover) {
      setPhotos([]);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);

    getRoverCameras(rover, apiKey, camera || undefined, date || undefined, page)
      .then((res) => {
        if (!mounted) return;
        setPhotos(res || []);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || "Failed to load photos");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [rover, camera, date, page, apiKey]);

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5/6 h-5/6 bg-white rounded-sm bg-opacity-90 flex flex-col z-50 p-4 overflow-auto">
      <button
        className="text-white absolute right-2 top-2 px-3 py-1 rounded bg-red-600 hover:bg-red-700"
        onClick={onclose}
      >
        X
      </button>

      <h3 className="text-black text-xl font-semibold mb-3">Results for {rover}</h3>

      {loading && <div className="text-black">Loading photos…</div>}
      {error && <div className="text-red-600">Error: {error}</div>}

      {!loading && !error && photos.length === 0 && (
        <div className="text-black">No photos found for this query.</div>
      )}

      {!loading && photos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((p) => (
            <div key={p.id} className="bg-white rounded shadow overflow-hidden">
              <a href={p.img_src} target="_blank" rel="noreferrer">
                <img
                  src={p.img_src}
                  alt={`Mars photo ${p.id}`}
                  className="w-full h-48 object-cover"
                />
              </a>
              <div className="p-2 text-sm text-gray-700">
                <div><strong>Camera:</strong> {p.camera?.full_name || p.camera?.name}</div>
                <div><strong>Earth date:</strong> {p.earth_date}</div>
                <div><strong>Sol:</strong> {p.sol}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}