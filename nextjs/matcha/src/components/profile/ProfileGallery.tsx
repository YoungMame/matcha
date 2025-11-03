"use client";

import { useState } from "react";
import Image from "next/image";

interface ProfileGalleryProps {
  profilePicture: string | null;
  additionalPictures: (string | null)[];
  userName: string;
}

export default function ProfileGallery({
  profilePicture,
  additionalPictures,
  userName,
}: ProfileGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  
  const allImages = [profilePicture, ...additionalPictures].filter(
    (img): img is string => img !== null
  );

  if (allImages.length === 0) {
    return (
      <div className="w-full aspect-3/4 bg-linear-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center">
        <span className="text-6xl">📷</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative w-full aspect-3/4 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
        <Image
          src={allImages[selectedImage]}
          alt={`Photo de ${userName}`}
          fill
          className="object-cover"
          priority
        />
        
        {/* Navigation Arrows */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={() =>
                setSelectedImage((prev) =>
                  prev === 0 ? allImages.length - 1 : prev - 1
                )
              }
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all"
              aria-label="Image précédente"
            >
              ‹
            </button>
            <button
              onClick={() =>
                setSelectedImage((prev) =>
                  prev === allImages.length - 1 ? 0 : prev + 1
                )
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all"
              aria-label="Image suivante"
            >
              ›
            </button>
          </>
        )}
        
        {/* Image Counter */}
        {allImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
            {selectedImage + 1} / {allImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail Grid */}
      {allImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(idx)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                selectedImage === idx
                  ? "border-indigo-600 scale-95"
                  : "border-transparent hover:border-gray-300"
              }`}
            >
              <Image
                src={img}
                alt={`Miniature ${idx + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
