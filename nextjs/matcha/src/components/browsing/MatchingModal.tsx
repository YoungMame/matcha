"use client";

import { useState } from "react";
import Image from "next/image";
import Modal from "@/components/common/Modal";
import Typography from "@/components/common/Typography";

interface UserProfile {
	id: string;
	firstName: string;
	lastName: string;
	birthday: string;
	biography: string;
	interests: string[];
	gender: string;
	interestedInGenders: string[];
	profilePicture: string | null;
	additionalPictures: (string | null)[];
}

interface MatchingModalProps {
	isOpen: boolean;
	onClose: () => void;
	user: UserProfile | null;
	onLike?: (userId: string) => void;
	onPass?: (userId: string) => void;
	isFromMatch?: boolean; // When true, shows chat icon instead of heart
}

export default function MatchingModal({
	isOpen,
	onClose,
	user,
	onLike,
	onPass,
	isFromMatch = false,
}: MatchingModalProps) {
	const [currentImageIndex, setCurrentImageIndex] = useState(0);

	if (!user) return null;

	// Get all available pictures
	const allPictures = [
		user.profilePicture,
		...user.additionalPictures,
	].filter((pic): pic is string => pic !== null);

	// Calculate age from birthday
	const calculateAge = (birthday: string): number => {
		const birthDate = new Date(birthday);
		const today = new Date();
		let age = today.getFullYear() - birthDate.getFullYear();
		const monthDiff = today.getMonth() - birthDate.getMonth();
		if (
			monthDiff < 0 ||
			(monthDiff === 0 && today.getDate() < birthDate.getDate())
		) {
			age--;
		}
		return age;
	};

	const age = calculateAge(user.birthday);

	const handlePrevImage = () => {
		setCurrentImageIndex((prev) =>
			prev === 0 ? allPictures.length - 1 : prev - 1
		);
	};

	const handleNextImage = () => {
		setCurrentImageIndex((prev) =>
			prev === allPictures.length - 1 ? 0 : prev + 1
		);
	};

	const handleLike = () => {
		onLike?.(user.id);
		onClose();
	};

	const handlePass = () => {
		onPass?.(user.id);
		onClose();
	};

	const handleModalClose = () => {
		setCurrentImageIndex(0); // Reset to first image when closing
		onClose();
	};

	return (
		<Modal isOpen={isOpen} onClose={handleModalClose}>
			<div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg overflow-hidden max-h-[90vh] flex flex-col">
				{/* Image Section - Half height */}
				<div className="relative h-[45vh] bg-gray-200 dark:bg-gray-700">
					{allPictures.length > 0 && (
						<>
							<Image
								src={allPictures[currentImageIndex]}
								alt={`${user.firstName} - Photo ${currentImageIndex + 1}`}
								fill
								className="object-cover"
							/>

							{/* Navigation Arrows */}
							{allPictures.length > 1 && (
								<>
									<button
										onClick={handlePrevImage}
										className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
										aria-label="Photo précédente"
									>
										<svg
											className="w-6 h-6"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M15 19l-7-7 7-7"
											/>
										</svg>
									</button>
									<button
										onClick={handleNextImage}
										className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
										aria-label="Photo suivante"
									>
										<svg
											className="w-6 h-6"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9 5l7 7-7 7"
											/>
										</svg>
									</button>
								</>
							)}

							{/* Image Indicators */}
							{allPictures.length > 1 && (
								<div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1">
									{allPictures.map((_, index) => (
										<div
											key={index}
											className={`h-1 rounded-full transition-all ${index === currentImageIndex
												? "w-8 bg-white"
												: "w-1 bg-white/50"
												}`}
										/>
									))}
								</div>
							)}

							{/* Action Buttons */}
							<div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-6">
								<button
									onClick={handlePass}
									className="w-14 h-14 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
									aria-label="Passer"
								>
									<svg
										className="w-8 h-8 text-red-500"
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
								<button
									onClick={handleLike}
									className="w-14 h-14 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
									aria-label={isFromMatch ? "Envoyer un message" : "Liker"}
								>
									{isFromMatch ? (
										// Chat icon for matches
										<svg
											className="w-8 h-8 text-green-500"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
											/>
										</svg>
									) : (
										// Heart icon for browsing
										<svg
											className="w-8 h-8 text-green-500"
											fill="currentColor"
											viewBox="0 0 24 24"
										>
											<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
										</svg>
									)}
								</button>
							</div>
						</>
					)}
				</div>

				{/* Info Section - Scrollable */}
				<div className="flex-1 overflow-y-auto p-6">
					{/* Name and Age */}
					<Typography variant="h2" className="mb-4">
						{user.firstName}, {age}
					</Typography>

					{/* Biography */}
					{user.biography && (
						<div className="mb-6">
							<Typography variant="body" color="secondary">
								{user.biography}
							</Typography>
						</div>
					)}

					{/* Interests */}
					{user.interests.length > 0 && (
						<div>
							<Typography variant="body" className="font-semibold mb-3">
								Centres d'intérêt
							</Typography>
							<div className="flex flex-wrap gap-2">
								{user.interests.map((interest, index) => (
									<span
										key={index}
										className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm"
									>
										{interest}
									</span>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</Modal>
	);
}
