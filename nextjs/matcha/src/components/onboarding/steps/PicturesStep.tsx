"use client";

import { useRef, useState } from "react";
import Typography from "@/components/common/Typography";
import ErrorModal from "@/components/common/ErrorModal";
import { MAX_ADDITIONAL_PICTURES } from "@/constants/onboarding";
import Cropper from 'react-easy-crop'
import getCroppedImg from '@/utils/cropImage';
import RangeSlider from "@/components/common/RangeSlider";

// declare type Size = {
//     width: number;
//     height: number;
// };
// declare type MediaSize = {
//     width: number;
//     height: number;
//     naturalWidth: number;
//     naturalHeight: number;
// };

declare type Point = {
    x: number;
    y: number;
};
declare type Area = {
    width: number;
    height: number;
    x: number;
    y: number;
};

const CROP_AREA_ASPECT = 9 / 16;

interface PicturesStepProps {
	profilePicture: File | null;
	additionalPictures: (File | null)[];
	onChange: (
		field: "profilePicture" | "additionalPictures",
		value: File | null | (File | null)[]
	) => void;
	showValidation?: boolean;
}

const Output = ({ croppedArea}: { croppedArea: Area }) => {
  const scale = 100 / croppedArea.width;
  const transform = {
    x: `${-croppedArea.x * scale}%`,
    y: `${-croppedArea.y * scale}%`,
    scale,
    width: "calc(100% + 0.5px)",
    height: "auto"
  };

  const imageStyle = {
    transform: `translate3d(${transform.x}, ${transform.y}, 0) scale3d(${transform.scale},${transform.scale},1)`,
    width: transform.width,
    height: transform.height
  };

  return (
    <div
      className="output"
      style={{ paddingBottom: `${100 / CROP_AREA_ASPECT}%` }}
    >
      <img src="/assets/dog.jpeg" alt="" style={imageStyle} />
    </div>
  );
};

export default function PicturesStep({
	profilePicture,
	additionalPictures,
	onChange,
	showValidation = false,
}: PicturesStepProps) {
	const profileInputRef = useRef<HTMLInputElement>(null);
	const additionalInputRefs = useRef<(HTMLInputElement | null)[]>([]);
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

	const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
	const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg"];

	const validateFile = (
		file: File | null
	): { valid: boolean; error?: string } => {
		if (!file) return { valid: true };

		if (!ALLOWED_TYPES.includes(file.type)) {
			return {
				valid: false,
				error: "Seuls les fichiers PNG et JPG/JPEG sont autorisés",
			};
		}

		if (file.size > MAX_FILE_SIZE) {
			return {
				valid: false,
				error: "La taille du fichier doit être inférieure à 5 Mo",
			};
		}

		return { valid: true };
	};

	const showError = (message: string) => {
		setErrorMessage(message);
		setIsErrorModalOpen(true);
	};

	const checkDuplicateImage = (
		newFile: File,
		isForProfile: boolean = false
	): boolean => {
		// Check against profile picture
		if (profilePicture && !isForProfile) {
			if (
				profilePicture.name === newFile.name &&
				profilePicture.size === newFile.size &&
				profilePicture.lastModified === newFile.lastModified
			) {
				return true;
			}
		}

		// Check against additional pictures
		for (const picture of additionalPictures) {
			if (picture) {
				if (
					picture.name === newFile.name &&
					picture.size === newFile.size &&
					picture.lastModified === newFile.lastModified
				) {
					return true;
				}
			}
		}

		return false;
	};

	const handleProfilePictureChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = e.target.files?.[0] || null;
		const validation = validateFile(file);

		if (!validation.valid) {
			showError(validation.error!);
			if (profileInputRef.current) {
				profileInputRef.current.value = "";
			}
			return;
		}

		// Check for duplicate
		if (file && checkDuplicateImage(file, true)) {
			showError("Cette image a déjà été téléchargée");
			if (profileInputRef.current) {
				profileInputRef.current.value = "";
			}
			return;
		}

		onChange("profilePicture", file);
	};

	const handleAdditionalPictureChange = (index: number, file: File | null) => {
		const validation = validateFile(file);

		if (!validation.valid) {
			showError(validation.error!);
			if (additionalInputRefs.current[index]) {
				additionalInputRefs.current[index]!.value = "";
			}
			return;
		}

		// Check for duplicate
		if (file && checkDuplicateImage(file, false)) {
			showError("Cette image a déjà été téléchargée");
			if (additionalInputRefs.current[index]) {
				additionalInputRefs.current[index]!.value = "";
			}
			return;
		}

		const newPictures = [...additionalPictures];
		newPictures[index] = file;
		onChange("additionalPictures", newPictures);
	};

	const removeProfilePicture = () => {
		onChange("profilePicture", null);
		if (profileInputRef.current) {
			profileInputRef.current.value = "";
		}
	};

	const removeAdditionalPicture = (index: number) => {
		handleAdditionalPictureChange(index, null);
		if (additionalInputRefs.current[index]) {
			additionalInputRefs.current[index]!.value = "";
		}
	};

	const getImageUrl = (file: File | null): string | null => {
		return file ? URL.createObjectURL(file) : null;
	};

	const hasError = showValidation && !profilePicture;

  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [croppedImage, setCroppedImage] = useState<string | null>(null)

  const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }

  const showCroppedImage = async () => {
    try {
      const croppedImage = await getCroppedImg(
        profilePicture ? getImageUrl(profilePicture)! : "",
        croppedAreaPixels as Area,
        rotation
      )
      console.log('donee', { croppedImage })
      setCroppedImage(croppedImage as string)
    } catch (e) {
      console.error(e)
    }
  }

  const onClose = () => {
    setCroppedImage(null)
  }

	return (
		<div className="space-y-8">
			{/* Profile Picture */}
			<div>
				<Typography variant="body" bold className="mb-2">
					Photo de profil *
				</Typography>
				<Typography variant="small" color="secondary" className="mb-2">
					Ce sera votre photo principale (PNG ou JPG/JPEG, max 5 Mo)
				</Typography>
				{hasError && (
					<Typography variant="small" color="error" className="mb-2">
						La photo de profil est requise
					</Typography>
				)}

				<div className="flex flex-col lg:flex-row items-start gap-4">
					<div
						className={`
							relative w-48 h-48 rounded-lg border-2 border-dashed
							${profilePicture
								? "border-pink-500"
								: hasError
									? "border-red-500"
									: "border-gray-300 dark:border-gray-700"
							}
							overflow-hidden
						`}
					>
						{profilePicture ? (
							<>
								<img
									src={getImageUrl(profilePicture)!}
									alt="Profile"
									className="w-full h-full object-cover"
								/>
								<button
									onClick={removeProfilePicture}
									className="
										absolute top-2 right-2
										p-2 rounded-full
										bg-red-500 text-white
										hover:bg-red-600
										transition-all
									"
								>
									<svg
										className="w-4 h-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</button>
							</>
						) : (
							<label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
								<svg
									className="w-12 h-12 text-gray-400 mb-2"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 4v16m8-8H4"
									/>
								</svg>
								<Typography variant="small" color="secondary">
									Télécharger une photo
								</Typography>
								<input
									ref={profileInputRef}
									type="file"
									accept=".png,.jpg,.jpeg,image/png,image/jpeg"
									onChange={handleProfilePictureChange}
									className="hidden"
								/>
							</label>
						)}
					</div>
					{profilePicture && (<>
							<div className="relative z-10 w-48 h-80 bg-gray-200">
								<Cropper
									image={getImageUrl(profilePicture) || "none"}
									crop={crop}
									zoom={zoom}
									aspect={CROP_AREA_ASPECT}
									onCropChange={setCrop}
									onZoomChange={setZoom}
									onCropComplete={onCropComplete}
								/>
								{/* TODO create slider component */}
								<button onClick={() => setRotation((rotation + 90) % 360)}>ROTATE DROITE</button>
								<button onClick={() => setRotation((rotation - 90) % 360)}>ROTATE GAUCHE</button>
								<button onClick={showCroppedImage}>CROP</button>
							</div>
							<div className="viewer relative z-10 w-48 h-80 bg-gray-200">
								<img src={croppedImage || ""} alt="" />
							</div>
						</>
					)}
				</div>
			</div>

			{/* Additional Pictures */}
			<div>
				<Typography variant="body" bold className="mb-2">
					Photos supplémentaires
				</Typography>
				<Typography variant="small" color="secondary" className="mb-4">
					Ajoutez jusqu'à {MAX_ADDITIONAL_PICTURES} photos supplémentaires (PNG
					ou JPG/JPEG, max 5 Mo chacune)
				</Typography>

				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					{additionalPictures.map((picture, index) => (
						<div
							key={index}
							className={`
								relative aspect-square rounded-lg border-2 border-dashed
								${picture ? "border-pink-500" : "border-gray-300 dark:border-gray-700"}
								overflow-hidden
							`}
						>
							{picture ? (
								<>
									<img
										src={getImageUrl(picture)!}
										alt={`Additional ${index + 1}`}
										className="w-full h-full object-cover"
									/>
									<button
										onClick={() => removeAdditionalPicture(index)}
										className="
											absolute top-2 right-2
											p-1.5 rounded-full
											bg-red-500 text-white
											hover:bg-red-600
											transition-all
										"
									>
										<svg
											className="w-3 h-3"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
									</button>
								</>
							) : (
								<label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
									<svg
										className="w-8 h-8 text-gray-400 mb-1"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 4v16m8-8H4"
										/>
									</svg>
									<Typography variant="caption" color="secondary">
										Ajouter une photo
									</Typography>
									<input
										ref={(el) => {
											additionalInputRefs.current[index] = el;
										}}
										type="file"
										accept=".png,.jpg,.jpeg,image/png,image/jpeg"
										onChange={(e) =>
											handleAdditionalPictureChange(
												index,
												e.target.files?.[0] || null
											)
										}
										className="hidden"
									/>
								</label>
							)}
						</div>
					))}
				</div>
			</div>

			<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
				<Typography variant="small" color="secondary">
					<strong>Conseil :</strong> Utilisez des photos de haute qualité qui
					montrent clairement votre visage. Évitez les photos de groupe ou les
					images avec des filtres.
				</Typography>
			</div>

			<ErrorModal
				isOpen={isErrorModalOpen}
				onClose={() => setIsErrorModalOpen(false)}
				title="Erreur de téléchargement"
				message={errorMessage}
			/>
		</div>
	);
}
