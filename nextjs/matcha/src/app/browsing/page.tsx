"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Typography from "@/components/common/Typography";
import Stack from "@/components/common/Stack";
import Button from "@/components/common/Button";
import { useGeolocation } from "@/hooks/useGeolocation";
import LocationPermissionModal from "@/components/app/LocationPermissionModal";
import LeftDrawer from "@/components/browsing/LeftDrawer";
import SearchBar from "@/components/browsing/SearchBar";
import ProfileCard from "@/components/browsing/ProfileCard";
import MatchingModal from "@/components/browsing/MatchingModal";
import ChatInterface from "@/components/browsing/ChatInterface";
import ChatProfilePanel from "@/components/browsing/ChatProfilePanel";
import {
	generateMockUserProfiles,
	mockConversations,
	mockMatches,
	mockMessages,
} from "@/mocks/browsing_mocks";
import { UserProfile } from "@/types/UserProfile";

type Tab = "matches" | "messages";

interface User {
	id: string;
	username: string;
}

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

	const mockUserProfiles = useMemo(() => generateMockUserProfiles(30), []);

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
		// Only clear the selected conversation when switching to matches
		if (tab === "matches") {
			setSelectedConversationId(null);
		}
		// When switching to messages, the LeftDrawer will handle opening the last conversation
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
			<Stack
				direction="column"
				align="center"
				justify="center"
				className="bg-gray-50 dark:bg-gray-900 h-screen"
			>
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
				<Typography color="secondary" className="mt-4">
					Loading...
				</Typography>
			</Stack>
		);
	}

	if (error) {
		return (
			<Stack
				direction="column"
				align="center"
				justify="center"
				className="bg-gray-50 dark:bg-gray-900 h-screen"
			>
				<Stack direction="column" align="center" spacing="md">
					<Typography variant="h2" color="error">
						Authentication Error
					</Typography>
					<Typography color="secondary">
						Please try logging in again.
					</Typography>
					<Button
						variant="outline"
						onClick={() => router.push("/")}
					>
						← Back to home
					</Button>
				</Stack>
			</Stack>
		);
	}

	return (
		<Stack direction="row" className="h-full bg-gray-50 dark:bg-gray-900">
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
				<Stack direction="row" className="flex-1 overflow-hidden">
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
				</Stack>
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
		</Stack>
	);
}
