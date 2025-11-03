import { FilterOptions } from "@/components/browsing/FilterBar/types";
import { UserProfile } from "@/types/userProfile";
import { generateMockUserProfiles } from "@/mocks/browsing_mocks";

/**
 * Parse URL search params into FilterOptions
 */
export function parseSearchParams(searchParams: URLSearchParams): FilterOptions | null {
	const ageMin = searchParams.get('ageMin');
	const ageMax = searchParams.get('ageMax');
	const fameMin = searchParams.get('fameMin');
	const fameMax = searchParams.get('fameMax');
	const distanceMin = searchParams.get('distanceMin');
	const distanceMax = searchParams.get('distanceMax');
	const interests = searchParams.get('interests');

	// If no search params, return null
	if (!ageMin && !ageMax && !fameMin && !fameMax && !distanceMin && !distanceMax && !interests) {
		return null;
	}

	return {
		sortBy: 'none',
		selectedInterests: interests ? interests.split(',').filter(Boolean) : [],
		ranges: {
			age: [
				ageMin ? parseInt(ageMin, 10) : 18,
				ageMax ? parseInt(ageMax, 10) : 99,
			],
			location: [
				distanceMin ? parseInt(distanceMin, 10) : 2,
				distanceMax ? parseInt(distanceMax, 10) : 40,
			],
			fame: [
				fameMin ? parseInt(fameMin, 10) : 0,
				fameMax ? parseInt(fameMax, 10) : 1000,
			],
		},
	};
}

/**
 * Check if URL has any search parameters
 */
export function hasSearchParams(searchParams: URLSearchParams): boolean {
	return searchParams.has('ageMin') || 
		searchParams.has('ageMax') || 
		searchParams.has('fameMin') || 
		searchParams.has('fameMax') || 
		searchParams.has('distanceMin') || 
		searchParams.has('distanceMax') || 
		searchParams.has('interests');
}

/**
 * Calculate age from birthday string
 */
export function calculateAge(birthday: string): number {
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
}

/**
 * Filter profiles based on search criteria
 */
export function filterProfiles(
	profiles: Array<UserProfile & { distance: number; fame: number }>,
	filters: FilterOptions
): Array<UserProfile & { distance: number; fame: number }> {
	let filtered = [...profiles];

	// Apply age filter
	filtered = filtered.filter((profile) => {
		const age = calculateAge(profile.birthday);
		return age >= filters.ranges.age[0] && age <= filters.ranges.age[1];
	});

	// Apply location filter
	filtered = filtered.filter((profile) => {
		return (
			profile.distance >= filters.ranges.location[0] &&
			profile.distance <= filters.ranges.location[1]
		);
	});

	// Apply fame filter
	filtered = filtered.filter((profile) => {
		return (
			profile.fame >= filters.ranges.fame[0] &&
			profile.fame <= filters.ranges.fame[1]
		);
	});

	// Apply interests filter
	if (filters.selectedInterests.length > 0) {
		filtered = filtered.filter((profile) =>
			filters.selectedInterests.some((interest) =>
				profile.interests.includes(interest)
			)
		);
	}

	// Apply sorting
	switch (filters.sortBy) {
		case "age-asc":
			filtered.sort(
				(a, b) => calculateAge(a.birthday) - calculateAge(b.birthday)
			);
			break;
		case "age-desc":
			filtered.sort(
				(a, b) => calculateAge(b.birthday) - calculateAge(a.birthday)
			);
			break;
		case "location-asc":
			filtered.sort((a, b) => a.distance - b.distance);
			break;
		case "location-desc":
			filtered.sort((a, b) => b.distance - a.distance);
			break;
		case "fame-asc":
			filtered.sort((a, b) => a.fame - b.fame);
			break;
		case "fame-desc":
			filtered.sort((a, b) => b.fame - a.fame);
			break;
		case "none":
		default:
			// Keep original order
			break;
	}

	return filtered;
}
