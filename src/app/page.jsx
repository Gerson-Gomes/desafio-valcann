'use client';
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import SearchForm from "@/components/SearchForm";
import PhotoSwiper from "@/components/PhotoSwiper";
import { getFrontPhotos } from "@/lib/api.js";

export default function Home() {
  const [images, setImages] = useState([]);

  

  useEffect(() => {
    (async () => {
      const apiKey = process.env.NASA_API_KEY      
      const photos = await getFrontPhotos(apiKey);
      setImages(photos.map(p => p.img_src));
    })();
  }, []);

  return (
    <div className="font-sans flex flex-col justify-evenly items-center w-full h-full overflow-hidden">
      <Header />
      <SearchForm onSubmit={(data) => console.log("Form data:", data)} />
      <PhotoSwiper images={images} />
    </div>
  );
}
