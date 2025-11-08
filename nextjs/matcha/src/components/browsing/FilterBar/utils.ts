import { SortOption } from "./types";

export function getSortLabel(sortBy: SortOption): string {
	switch (sortBy) {
		case "age-asc":
			return "Âge ↑";
		case "age-desc":
			return "Âge ↓";
		case "location-asc":
			return "Distance ↑";
		case "location-desc":
			return "Distance ↓";
		case "fame-asc":
			return "Popularité ↑";
		case "fame-desc":
			return "Popularité ↓";
		default:
			return "Trier par";
	}
}

export function getSortState(
	sortBy: SortOption,
	category: "age" | "location" | "fame"
): "asc" | "desc" | "none" {
	if (sortBy === `${category}-asc`) return "asc";
	if (sortBy === `${category}-desc`) return "desc";
	return "none";
}

export function getNextSortOption(
	currentSortBy: SortOption,
	category: "age" | "location" | "fame"
): SortOption {
	const currentState = getSortState(currentSortBy, category);

	switch (currentState) {
		case "none":
			return `${category}-asc` as SortOption;
		case "asc":
			return `${category}-desc` as SortOption;
		case "desc":
			return "none";
	}
}

export function hasActiveFilters(
	sortBy: SortOption,
	selectedInterests: string[],
	ageRange: [number, number],
	locationRange: [number, number],
	fameRange: [number, number]
): boolean {
	return (
		sortBy !== "none" ||
		selectedInterests.length > 0 ||
		ageRange[0] !== 18 ||
		ageRange[1] !== 99 ||
		locationRange[0] !== 2 ||
		locationRange[1] !== 40 ||
		fameRange[0] !== 0 ||
		fameRange[1] !== 1000
	);
}

export function hasActiveRangeFilters(
	ageRange: [number, number],
	locationRange: [number, number],
	fameRange: [number, number]
): boolean {
	return (
		ageRange[0] !== 18 ||
		ageRange[1] !== 99 ||
		locationRange[0] !== 2 ||
		locationRange[1] !== 40 ||
		fameRange[0] !== 0 ||
		fameRange[1] !== 1000
	);
}

export function filterInterests(
	availableInterests: string[],
	searchQuery: string
): string[] {
	return availableInterests.filter((interest) =>
		interest.toLowerCase().includes(searchQuery.toLowerCase())
	);
}

export function isCustomInterest(
	searchQuery: string,
	availableInterests: string[]
): boolean {
	const trimmed = searchQuery.trim();
	return (
		trimmed.length > 0 &&
		!availableInterests.some(
			(interest) => interest.toLowerCase() === trimmed.toLowerCase()
		)
	);
}

export function findMatchingInterest(
	searchQuery: string,
	availableInterests: string[]
): string | undefined {
	const trimmed = searchQuery.trim();
	return availableInterests.find(
		(interest) => interest.toLowerCase() === trimmed.toLowerCase()
	);
}
