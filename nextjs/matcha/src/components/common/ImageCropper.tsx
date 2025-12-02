"use client";

import Cropper from "react-easy-crop";
import IconButton from "@/components/common/IconButton";
import Button from "@/components/common/Button";
import getImageUrl from '@/utils/getImageUrl';
import type { Area } from '@/utils/cropImage';

const CROP_AREA_ASPECT = 9 / 16;

export default function ImageCropper({
    profilePicture,
    additionalPictures,
    currentCroppingIndex,
    onCropComplete,
    submitImage,
    zoom,
    setZoom,
    rotation,
    setRotation,
    crop, setCrop
}: {
    profilePicture: File | null;
    additionalPictures: (File | null)[];
    currentCroppingIndex: number;
    onCropComplete: (croppedArea: Area, croppedAreaPixels: Area) => void;
    submitImage: () => void;
    zoom: number;
    setZoom: (zoom: number) => void;
    rotation: number;
    setRotation: (rotation: number) => void;
    crop: { x: number; y: number };
    setCrop: (crop: { x: number; y: number }) => void;
}) {
    return (<div className="flex flex-col">
        <div className="relative z-10 w-48 h-80 bg-gray-200">
            <Cropper
                image={getImageUrl(currentCroppingIndex === 0 ? profilePicture : (additionalPictures[currentCroppingIndex - 1] || null)) || "none"}
                crop={crop}
                zoom={zoom}
                maxZoom={3}
                rotation={rotation}
                aspect={CROP_AREA_ASPECT}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
            />
        </div>
        <div className="flex w-full flex-row justify-between">
            <IconButton
                onClick={() => setRotation((rotation - 90 + 360) % 360)}
                size="small"
                aria-label="Rotate left"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h1.168a2 2 0 011.88 1.316l.957 2.871a1 1 0 01-.95 1.313H3m0-5.5l1.172-1.172a4 4 0 015.656 0L10 9m-7 1v11a1 1 0 001 1h5a1 1 0 001-1v-3m-7-8V3a1 1 0 011-1h5a1 1 0 011 1v4" />
                </svg>
            </IconButton>
            <IconButton
                onClick={() => setRotation((rotation + 90) % 360)}
                size="small"
                aria-label="Rotate right"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-1.168a2 2 0 00-1.88 1.316l-.957 2.871a1 1 0 00.95 1.313H21m0-5.5l-1.172-1.172a4 4 0 00-5.656 0L14 9m7 1v11a1 1 0 01-1 1h-5a1 1 0 01-1-1v-3m7-8V3a1 1 0 00-1-1h-5a1 1 0 00-1 1v4" />
                </svg>
            </IconButton>
        </div>
        <div className="p-1 flex flex-col items-center">

            <Button onClick={submitImage}>Confirmer</Button>
        </div>
    </div>);
}
