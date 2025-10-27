"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Typography from "@/components/common/Typography";
import { useGeolocation } from "@/hooks/useGeolocation";
import LocationPermissionModal from "@/components/app/LocationPermissionModal";
import LeftDrawer from "@/components/browsing/LeftDrawer";
import SearchBar from "@/components/browsing/SearchBar";
import ProfileCard from "@/components/browsing/ProfileCard";
import MatchingModal from "@/components/browsing/MatchingModal";
import ChatInterface from "@/components/browsing/ChatInterface";
import ChatProfilePanel from "@/components/browsing/ChatProfilePanel";

type Tab = "matches" | "messages";

interface User {
	id: string;
	username: string;
}

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

// Mock data with full user structure
const mockUserProfiles: UserProfile[] = [
	{
		id: "1",
		firstName: "Alice",
		lastName: "Dupont",
		birthday: "1999-03-15",
		biography:
			"Passionnée de voyages et de photographie. J'adore découvrir de nouvelles cultures et partager des moments authentiques.",
		interests: ["Voyages", "Photographie", "Cuisine", "Yoga"],
		gender: "female",
		interestedInGenders: ["male"],
		profilePicture: "/bob.jpg",
		additionalPictures: ["/bob.jpg", "/bob.jpg", null, null],
	},
	{
		id: "2",
		firstName: "Marie",
		lastName: "Martin",
		birthday: "1997-07-22",
		biography:
			"Architecte le jour, artiste la nuit. J'aime créer et explorer l'art sous toutes ses formes.",
		interests: ["Architecture", "Art", "Musique", "Randonnée"],
		gender: "female",
		interestedInGenders: ["male"],
		profilePicture: "/bob.jpg",
		additionalPictures: ["/bob.jpg", null, null, null],
	},
	{
		id: "3",
		firstName: "Laura",
		lastName: "Bernard",
		birthday: "2001-11-08",
		biography:
			"Étudiante en médecine et amoureuse des animaux. Je cherche quelqu'un avec qui partager de bons moments.",
		interests: ["Médecine", "Animaux", "Lecture", "Sport"],
		gender: "female",
		interestedInGenders: ["male"],
		profilePicture: "/bob.jpg",
		additionalPictures: ["/bob.jpg", "/bob.jpg", "/bob.jpg", null],
	},
	{
		id: "4",
		firstName: "Camille",
		lastName: "Petit",
		birthday: "1999-05-30",
		biography:
			"Développeuse web passionnée par les nouvelles technologies et l'innovation.",
		interests: ["Technologie", "Gaming", "Cinéma", "Running"],
		gender: "female",
		interestedInGenders: ["male"],
		profilePicture: "/bob.jpg",
		additionalPictures: ["/bob.jpg", null, null, null],
	},
	{
		id: "5",
		firstName: "Sarah",
		lastName: "Moreau",
		birthday: "1998-01-12",
		biography:
			"Professeure de danse et amoureuse de la vie. Toujours prête pour de nouvelles aventures !",
		interests: ["Danse", "Musique", "Fitness", "Mode"],
		gender: "female",
		interestedInGenders: ["male"],
		profilePicture: "/bob.jpg",
		additionalPictures: ["/bob.jpg", "/bob.jpg", null, null],
	},
	{
		id: "6",
		firstName: "Léa",
		lastName: "Dubois",
		birthday: "2002-09-25",
		biography:
			"Étudiante en communication, passionnée par les réseaux sociaux et le marketing digital.",
		interests: ["Marketing", "Réseaux sociaux", "Café", "Voyage"],
		gender: "female",
		interestedInGenders: ["male"],
		profilePicture: "/bob.jpg",
		additionalPictures: [null, null, null, null],
	},
	{
		id: "7",
		firstName: "Chloé",
		lastName: "Roux",
		birthday: "1996-04-18",
		biography:
			"Chef cuisinière qui aime expérimenter de nouvelles saveurs. Gourmande assumée !",
		interests: ["Cuisine", "Gastronomie", "Vin", "Pâtisserie"],
		gender: "female",
		interestedInGenders: ["male"],
		profilePicture: "/bob.jpg",
		additionalPictures: ["/bob.jpg", "/bob.jpg", "/bob.jpg", "/bob.jpg"],
	},
	{
		id: "8",
		firstName: "Manon",
		lastName: "Leroy",
		birthday: "2000-02-14",
		biography:
			"Graphiste freelance et amoureuse de la nature. Je cherche quelqu'un de créatif et authentique.",
		interests: ["Design", "Nature", "Randonnée", "Photographie"],
		gender: "female",
		interestedInGenders: ["male"],
		profilePicture: "/bob.jpg",
		additionalPictures: ["/bob.jpg", null, null, null],
	},
	{
		id: "9",
		firstName: "Jade",
		lastName: "Simon",
		birthday: "1999-08-07",
		biography:
			"Infirmière dévouée le jour, aventurière le week-end. J'adore les activités en plein air.",
		interests: ["Sport", "Nature", "Camping", "Vélo"],
		gender: "female",
		interestedInGenders: ["male"],
		profilePicture: "/bob.jpg",
		additionalPictures: ["/bob.jpg", "/bob.jpg", null, null],
	},
	{
		id: "10",
		firstName: "Luna",
		lastName: "Laurent",
		birthday: "2001-06-20",
		biography:
			"Musicienne et compositrice. La musique est ma vie et je cherche quelqu'un qui partage cette passion.",
		interests: ["Musique", "Concert", "Guitare", "Chant"],
		gender: "female",
		interestedInGenders: ["male"],
		profilePicture: "/bob.jpg",
		additionalPictures: ["/bob.jpg", null, null, null],
	},
];

// Simplified data for matches
const mockMatches = mockUserProfiles.slice(0, 3).map((user) => ({
	id: user.id,
	name: user.firstName,
	pictureUrl: user.profilePicture || "/bob.jpg",
}));

// Mock conversations with user IDs matching mockUserProfiles
const mockConversations = [
	{
		id: "conv-1",
		userId: "1", // Alice
		name: "Alice",
		pictureUrl: "/bob.jpg",
		lastMessage: "Salut ! Comment ça va ?",
	},
	{
		id: "conv-2",
		userId: "2", // Marie
		name: "Marie",
		pictureUrl: "/bob.jpg",
		lastMessage: "On se voit quand ?",
	},
];

// Mock messages for conversations
const mockMessages = {
	"conv-1": [
		{
			id: "msg-1",
			senderId: "1",
			content: "Salut ! Comment ça va ?",
			timestamp: new Date("2025-10-27T10:00:00"),
		},
		{
			id: "msg-2",
			senderId: "current-user",
			content: "Salut Alice ! Ça va bien et toi ?",
			timestamp: new Date("2025-10-27T10:05:00"),
		},
		{
			id: "msg-3",
			senderId: "1",
			content: "Très bien merci ! Tu as passé un bon week-end ?",
			timestamp: new Date("2025-10-27T10:10:00"),
		},
	],
	"conv-2": [
		{
			id: "msg-4",
			senderId: "2",
			content: "On se voit quand ?",
			timestamp: new Date("2025-10-27T14:00:00"),
		},
		{
			id: "msg-5",
			senderId: "current-user",
			content: "Que dirais-tu de vendredi soir ?",
			timestamp: new Date("2025-10-27T14:15:00"),
		},
	],
};

export default function BrowsingPage() {
	const router = useRouter();
	const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isFromMatch, setIsFromMatch] = useState(false);
	const [activeTab, setActiveTab] = useState<Tab>("matches");
	const [selectedConversationId, setSelectedConversationId] = useState<
		string | null
	>(null);

	const {
		hasAsked,
		permission,
		coordinates,
		requestPermission,
		denyPermission,
	} = useGeolocation();

	// Fetch current user data
	const { data, isLoading, error } = useQuery<{ user: User }>({
		queryKey: ["user"],
		queryFn: async () => {
			const response = await axios.get("/api/auth/me");
			return response.data;
		},
		retry: false,
	});

	const handleOpenProfile = (userId: string, fromMatch = false) => {
		const user = mockUserProfiles.find((u) => u.id === userId);
		if (user) {
			setSelectedUser(user);
			setIsFromMatch(fromMatch);
			setIsModalOpen(true);
		}
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setTimeout(() => setSelectedUser(null), 300); // Clear after animation
	};

	const handleLike = (userId: string) => {
		console.log("Liked user:", userId);
		// TODO: Implement like logic
	};

	const handlePass = (userId: string) => {
		console.log("Passed user:", userId);
		// TODO: Implement pass logic
	};

	const handleConversationClick = (conversationId: string) => {
		setSelectedConversationId(conversationId);
	};

	const handleTabChange = (tab: Tab) => {
		setActiveTab(tab);
		// When switching back to matches, clear the selected conversation
		if (tab === "matches") {
			setSelectedConversationId(null);
		}
	};

	const handleSendMessage = (content: string) => {
		console.log("Sending message:", content);
		// TODO: Implement send message logic
	};

	// Get the current conversation data
	const selectedConversation = selectedConversationId
		? mockConversations.find((conv) => conv.id === selectedConversationId)
		: null;

	const selectedChatUser =
		selectedConversation && selectedConversation.userId
			? mockUserProfiles.find((u) => u.id === selectedConversation.userId)
			: null;

	const conversationMessages = selectedConversationId
		? mockMessages[selectedConversationId as keyof typeof mockMessages] || []
		: [];

	// Calculate age helper
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

	if (isLoading) {
		return (
			<div className="flex items-center justify-center bg-gray-50 dark:bg-gray-900">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
					<Typography color="secondary" className="mt-4">
						Loading...
					</Typography>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center bg-gray-50 dark:bg-gray-900">
				<div className="text-center">
					<Typography variant="h2" color="error">
						Authentication Error
					</Typography>
					<Typography color="secondary" className="mt-2">
						Please try logging in again.
					</Typography>
					<div className="mt-4">
						<button
							onClick={() => router.push("/")}
							className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 underline"
						>
							← Back to home
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-screen bg-gray-50 dark:bg-gray-900">
			{/* Left Drawer */}
			<LeftDrawer
				currentUser={{
					username: data?.user.username || "User",
					pictureUrl: "/bob.jpg",
				}}
				matches={mockMatches}
				conversations={mockConversations}
				onMatchClick={(userId) => handleOpenProfile(userId, true)}
				onConversationClick={handleConversationClick}
				activeTab={activeTab}
				onTabChange={handleTabChange}
			/>

			{/* Main Content - Conditional rendering based on view */}
			{selectedConversationId && selectedChatUser ? (
				// Chat View
				<div className="flex flex-1 h-screen overflow-hidden">
					<ChatInterface
						conversationId={selectedConversationId}
						otherUser={{
							id: selectedChatUser.id,
							name: selectedChatUser.firstName,
							pictureUrl: selectedChatUser.profilePicture || "/bob.jpg",
						}}
						messages={conversationMessages}
						currentUserId="current-user"
						onSendMessage={handleSendMessage}
					/>
					<ChatProfilePanel user={selectedChatUser} />
				</div>
			) : (
				// Browse View
				<div className="flex-1 overflow-y-auto">
					<div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
						{/* Search Bar */}
						<SearchBar placeholder="Rechercher des profils..." />

						{/* Profile Grid */}
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
							{mockUserProfiles.map((profile) => (
								<ProfileCard
									key={profile.id}
									id={profile.id}
									name={profile.firstName}
									age={calculateAge(profile.birthday)}
									pictureUrl={profile.profilePicture || "/bob.jpg"}
									onClick={() => handleOpenProfile(profile.id, false)}
								/>
							))}
						</div>
					</div>
				</div>
			)}

			{/* Matching Modal */}
			<MatchingModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				user={selectedUser}
				onLike={handleLike}
				onPass={handlePass}
				isFromMatch={isFromMatch}
			/>

			{/* Location Permission Modal */}
			<LocationPermissionModal
				isOpen={!hasAsked}
				onAllow={requestPermission}
				onDeny={denyPermission}
			/>
		</div>
	);
}
