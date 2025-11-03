export type SortOption =
	| "age-asc"
	| "age-desc"
	| "location-asc"
	| "location-desc"
	| "fame-asc"
	| "fame-desc"
	| "none";

export interface RangeFilters {
	age: [number, number];
	location: [number, number];
	fame: [number, number];
}

export interface FilterOptions {
	sortBy: SortOption;
	selectedInterests: string[];
	ranges: RangeFilters;
}
