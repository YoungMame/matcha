"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Typography from "@/components/common/Typography";
import Stack from "@/components/common/Stack";
import Button from "@/components/common/Button";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useBrowsing as useBrowsingContext } from "@/contexts/BrowsingContext";
import { useProfiles, useLikeUser, usePassUser } from "@/hooks/useBrowsing";
import LocationPermissionModal from "@/components/app/LocationPermissionModal";
import SearchBar from "@/components/browsing/SearchBar";
import { FilterBar, FilterOptions } from "@/components/browsing/FilterBar";
import ProfileCard from "@/components/browsing/ProfileCard";
import MatchingModal from "@/components/browsing/MatchingModal";
import { UserProfile } from "@/types/userProfile";
import { parseSearchParams, calculateAge } from "@/lib/searchUtils";
import { AVAILABLE_INTERESTS } from "@/constants/onboarding";

export default function BrowsingPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { selectedMatchUserId, closeMatchModal } = useBrowsingContext();
	const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isFromMatch, setIsFromMatch] = useState(false);
	const [filters, setFilters] = useState<FilterOptions>({
		sortBy: "none",
		selectedInterests: [],
		ranges: {
			age: [18, 99],
			location: [2, 40],
			fame: [0, 1000],
		},
	});

	const {
		hasAsked,
		permission,
		coordinates,
		requestPermission,
		denyPermission,
	} = useGeolocation();

	// Parse search criteria from URL
	const searchCriteria = useMemo(() => {
		return parseSearchParams(searchParams);
	}, [searchParams]);

	// Build API request params from filters and search criteria
	const apiParams = useMemo(() => {
		const params = searchCriteria || filters;
		// Map sortBy values to backend format
		const sortByMap: Record<string, 'age' | 'location' | 'fame' | 'interests' | undefined> = {
			'age-asc': 'age',
			'age-desc': 'age',
			'location-asc': 'location',
			'location-desc': 'location',
			'fame-asc': 'fame',
			'fame-desc': 'fame',
			'interests-common': 'interests',
			'none': undefined,
		};
		
		return {
			ageMin: params.ranges.age[0],
			ageMax: params.ranges.age[1],
			locationMin: params.ranges.location[0],
			locationMax: params.ranges.location[1],
			fameMin: params.ranges.fame[0],
			fameMax: params.ranges.fame[1],
			interests: params.selectedInterests,
			sortBy: sortByMap[params.sortBy] || undefined,
			lat: coordinates?.latitude ?? undefined,
			lng: coordinates?.longitude ?? undefined,
		};
	}, [filters, searchCriteria, coordinates]);

	// Fetch profiles using React Query
	const { data: profilesData, isLoading: isLoadingProfiles, error: profilesError } = useProfiles(apiParams);
	
	// hooks for like/pass
	const { likeUser, isLiking } = useLikeUser();
	const { passUser, isPassing } = usePassUser();
	
	// When search params change, update filters
	useEffect(() => {
		if (searchCriteria) {
			setFilters(searchCriteria);
		}
	}, [searchCriteria]);

	// Convert profiles data to UserProfile format (temporary until backend matches)
	const profiles = useMemo(() => {
		if (!profilesData?.profiles) return [];
		return profilesData.profiles.map((p): UserProfile => ({
			id: p.id,
			username: p.username,
			firstName: p.firstName,
			lastName: p.lastName,
			birthday: p.birthday,
			biography: p.bio,
			interests: p.interests,
			profilePicture: p.profilePicture,
			additionalPictures: p.additionalPictures,
			distance: p.location.distance || 0,
			fame: p.fame,
			gender: p.gender,
			interestedInGenders: [], // Will be populated from backend
		}));
	}, [profilesData]);

	const handleFilterChange = useCallback((newFilters: FilterOptions) => {
		setFilters(newFilters);
	}, []);

	const handleOpenProfile = useCallback((userId: string, fromMatch = false) => {
		const user = profiles.find((u) => u.id === userId);
		if (user) {
			setSelectedUser(user);
			setIsFromMatch(fromMatch);
			setIsModalOpen(true);
		}
	}, [profiles]);
	
	// Watch for match modal state from context
	useEffect(() => {
		if (selectedMatchUserId) {
			handleOpenProfile(selectedMatchUserId, true);
		}
	}, [selectedMatchUserId, profiles, handleOpenProfile]);

	const handleCloseModal = () => {
		setIsModalOpen(false);
		closeMatchModal();
		setTimeout(() => setSelectedUser(null), 300); // Clear after animation
	};

	const handleLike = useCallback(async (userId: string) => {
		try {
			const data = await likeUser(userId);
			if (data.matched) {
				console.log("It's a match!", userId);
				// The MatchingModal will show the match
			}
		} catch (error) {
			console.error("Failed to like user:", error);
		}
	}, [likeUser]);

	const handlePass = useCallback(async (userId: string) => {
		try {
			await passUser(userId);
		} catch (error) {
			console.error("Failed to pass user:", error);
		}
	}, [passUser]);

	if (isLoadingProfiles) {
		return (
			<Stack
				direction="column"
				align="center"
				justify="center"
				className="bg-gray-50 dark:bg-gray-900 h-screen"
			>
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
				<Typography color="secondary" className="mt-4">
					Loading profiles...
				</Typography>
			</Stack>
		);
	}

	if (profilesError) {
		return (
			<Stack
				direction="column"
				align="center"
				justify="center"
				className="bg-gray-50 dark:bg-gray-900 h-screen"
			>
				<Stack direction="column" align="center" spacing="md">
					<Typography variant="h2" color="error">
						Error Loading Profiles
					</Typography>
					<Typography color="secondary">
						{(profilesError as any)?.response?.data?.error || profilesError.message || 'An error occurred'}
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
		<>
			{/* Main Content - Browse View */}
			<div className="flex-1 overflow-y-auto">
				<div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
					{/* Search Bar */}
					<SearchBar 
						availableInterests={AVAILABLE_INTERESTS}
						initialCriteria={searchCriteria ? {
							ageRange: searchCriteria.ranges.age,
							fameRange: searchCriteria.ranges.fame,
							locationRange: searchCriteria.ranges.location,
							interests: searchCriteria.selectedInterests,
						} : undefined}
						onSearch={(criteria) => {
							console.log("Search criteria:", criteria);
							// The URL update is already handled in handleSubmit
						}}
					/>

					{/* Filter Bar */}
					<FilterBar
						onFilterChange={handleFilterChange}
						availableInterests={AVAILABLE_INTERESTS}
					/>

					{/* Profile Grid */}
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
						{profiles.length === 0 ? (
							<div className="col-span-full text-center py-12">
								<Typography color="secondary">
									No profiles found. Try adjusting your filters.
								</Typography>
							</div>
						) : (
							profiles.map((profile) => (
								<ProfileCard
									key={profile.id}
									id={profile.id}
									name={profile.firstName}
									age={calculateAge(profile.birthday)}
									pictureUrl={profile.profilePicture || "/mock_pictures/femme1.jpg"}
									onClick={() => handleOpenProfile(profile.id, false)}
								/>
							))
						)}
					</div>
				</div>
			</div>

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
		</>
	);
}
