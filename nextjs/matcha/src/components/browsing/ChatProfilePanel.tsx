"use client";

import { useState } from "react";
import Image from "next/image";
import Typography from "@/components/common/Typography";
import Stack from "@/components/common/Stack";
import Badge from "@/components/common/Badge";
import ImageViewerModal from "@/components/common/ImageViewerModal";

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

interface ChatProfilePanelProps {
	user: UserProfile;
}

export default function ChatProfilePanel({ user }: ChatProfilePanelProps) {
	const [isImageModalOpen, setIsImageModalOpen] = useState(false);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

	// Get all available pictures
	const allPictures = [
		user.profilePicture,
		...user.additionalPictures,
	].filter((pic): pic is string => pic !== null);

	const handleOpenImageModal = (index: number) => {
		setCurrentImageIndex(index);
		setIsImageModalOpen(true);
	};

	const handleCloseImageModal = () => {
		setIsImageModalOpen(false);
		setCurrentImageIndex(0);
	};

	return (
		<>
			<Stack
				direction="column"
				spacing="none"
				className="w-80 shrink-0 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto h-full"
			>
			{/* Profile Picture */}
			{allPictures.length > 0 && (
				<div 
					className="relative aspect-square w-full cursor-pointer"
					onClick={() => handleOpenImageModal(0)}
				>
					<Image
						src={allPictures[0]}
						alt={user.firstName}
						fill
						className="object-cover"
					/>
				</div>
			)}

			{/* Profile Info */}
			<Stack direction="column" spacing="lg" className="p-6">
				{/* Name and Age */}
				<Typography variant="h2">
					{user.firstName}, {age}
				</Typography>

				{/* Biography */}
				{user.biography && (
					<Stack direction="column" spacing="sm">
						<Typography variant="body" className="font-semibold">
							À propos
						</Typography>
						<Typography variant="body" color="secondary">
							{user.biography}
						</Typography>
					</Stack>
				)}

				{/* Interests */}
				{user.interests.length > 0 && (
					<Stack direction="column" spacing="sm">
						<Typography variant="body" className="font-semibold">
							Centres d'intérêt
						</Typography>
						<Stack direction="row" spacing="sm" wrap>
							{user.interests.map((interest, index) => (
								<Badge key={index} variant="primary">
									{interest}
								</Badge>
							))}
						</Stack>
					</Stack>
				)}

				{/* Additional Pictures Grid */}
				{allPictures.length > 1 && (
					<Stack direction="column" spacing="sm">
						<Typography variant="body" className="font-semibold">
							Photos
						</Typography>
						<div className="grid grid-cols-2 gap-2">
							{allPictures.slice(1).map((picture, index) => (
								<div 
									key={index} 
									className="relative aspect-square rounded-lg overflow-hidden cursor-pointer"
									onClick={() => handleOpenImageModal(index + 1)}
								>
									<Image
										src={picture}
										alt={`${user.firstName} - Photo ${index + 2}`}
										fill
										className="object-cover"
									/>
								</div>
							))}
						</div>
					</Stack>
				)}
			</Stack>
		</Stack>

		<ImageViewerModal
			isOpen={isImageModalOpen}
			onClose={handleCloseImageModal}
			images={allPictures}
			currentIndex={currentImageIndex}
			onIndexChange={setCurrentImageIndex}
			title={`${user.firstName}, ${age}`}
		/>
	</>
	);
}
