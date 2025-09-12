'use client';
import { useEffect, useRef } from "react";

export default function PhotosSwiper({ images = [], height = 153, itemWidth = 153 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!images || images.length === 0) return;
    const container = containerRef.current;
    let scrollAmount = 0;
    const scrollStep = 2;
    const interval = 20;

    const loop = () => {
      scrollAmount += scrollStep;
      if (scrollAmount >= container.scrollWidth / 2) {
        scrollAmount = 0;
        container.scrollLeft = 0;
      } else {
        container.scrollLeft = scrollAmount;
      }
    };
    const id = setInterval(loop, interval);
    return () => clearInterval(id);
  }, [images]);

  return (
    <div ref={containerRef} className="w-1/2 flex space-x-4 overflow-hidden">
      {images.concat(images).map((src, i) => (
        <div key={`${src}-${i}`} className="bg-gray-300" style={{ height, minWidth: itemWidth }}>
          <img src={src} alt={`photo-${i}`} className="h-full w-full object-cover rounded-lg" />
        </div>
      ))}
    </div>
  );
}