"use client";

import Cropper from "react-easy-crop";
import IconButton from "@/components/common/IconButton";
import Button from "@/components/common/Button";
import getImageUrl from '@/utils/getImageUrl';

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
    onCropComplete: (croppedArea: any, croppedAreaPixels: any) => void;
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
                image={getImageUrl(currentCroppingIndex == 0 ? profilePicture : (additionalPictures[currentCroppingIndex - 1] || null)) || "none"}
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
                <div>\-</div>
            </IconButton>
            <IconButton
                onClick={() => setRotation((rotation + 90) % 360)}
                size="small"
                aria-label="Rotate right"
            >
                <div>-/</div>
            </IconButton>
        </div>
        <div className="p-1 flex flex-col items-center">

            <Button onClick={submitImage}>Confirmer</Button>
        </div>
    </div>);
}
