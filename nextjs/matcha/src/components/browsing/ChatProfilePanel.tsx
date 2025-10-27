import Image from "next/image";
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

interface ChatProfilePanelProps {
	user: UserProfile;
}

export default function ChatProfilePanel({ user }: ChatProfilePanelProps) {
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

	return (
		<div className="w-80 shrink-0 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto h-full">
			{/* Profile Picture */}
			{allPictures.length > 0 && (
				<div className="relative aspect-square w-full">
					<Image
						src={allPictures[0]}
						alt={user.firstName}
						fill
						className="object-cover"
					/>
				</div>
			)}

			{/* Profile Info */}
			<div className="p-6">
				{/* Name and Age */}
				<Typography variant="h2" className="mb-4">
					{user.firstName}, {age}
				</Typography>

				{/* Biography */}
				{user.biography && (
					<div className="mb-6">
						<Typography variant="body" className="font-semibold mb-2">
							À propos
						</Typography>
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

				{/* Additional Pictures Grid */}
				{allPictures.length > 1 && (
					<div className="mt-6">
						<Typography variant="body" className="font-semibold mb-3">
							Photos
						</Typography>
						<div className="grid grid-cols-2 gap-2">
							{allPictures.slice(1).map((picture, index) => (
								<div key={index} className="relative aspect-square rounded-lg overflow-hidden">
									<Image
										src={picture}
										alt={`${user.firstName} - Photo ${index + 2}`}
										fill
										className="object-cover"
									/>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
