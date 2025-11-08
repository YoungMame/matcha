"use client";

import { useState, useRef, useEffect } from "react";
import Button from "@/components/common/Button";
import RangeSlider from "@/components/common/RangeSlider";
import Icon from "@/components/common/Icon";
import Badge from "@/components/common/Badge";
import TextField from "@/components/common/TextField";
import Stack from "@/components/common/Stack";
import { Dropdown, DropdownDivider } from "@/components/common/Dropdown";
import ToggleSortOption from "./ToggleSortOption";
import SortOption from "./SortOption";
import InterestOption from "./InterestOption";
import type { FilterOptions, SortOption as SortOptionType } from "./types";
import {
	getSortLabel,
	getSortState,
	getNextSortOption,
	hasActiveFilters as checkActiveFilters,
	hasActiveRangeFilters as checkActiveRangeFilters,
	filterInterests,
	isCustomInterest as checkCustomInterest,
	findMatchingInterest,
} from "./utils";

interface FilterBarProps {
	onFilterChange: (filters: FilterOptions) => void;
	availableInterests?: string[];
}

export default function FilterBar({
	onFilterChange,
	availableInterests = [],
}: FilterBarProps) {
	const [sortBy, setSortBy] = useState<SortOptionType>("none");
	const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
	const [showSortDropdown, setShowSortDropdown] = useState(false);
	const [showInterestsDropdown, setShowInterestsDropdown] = useState(false);
	const [showRangeFilters, setShowRangeFilters] = useState(false);
	const [interestSearchQuery, setInterestSearchQuery] = useState("");
	
	// Range filter states
	const [ageRange, setAgeRange] = useState<[number, number]>([18, 99]);
	const [locationRange, setLocationRange] = useState<[number, number]>([2, 40]);
	const [fameRange, setFameRange] = useState<[number, number]>([0, 1000]);

	const sortDropdownRef = useRef<HTMLDivElement>(null);
	const interestsDropdownRef = useRef<HTMLDivElement>(null);
	const rangeFiltersRef = useRef<HTMLDivElement>(null);
	const interestSearchInputRef = useRef<HTMLInputElement>(null);

	// Close dropdowns when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				sortDropdownRef.current &&
				!sortDropdownRef.current.contains(event.target as Node)
			) {
				setShowSortDropdown(false);
			}
			if (
				interestsDropdownRef.current &&
				!interestsDropdownRef.current.contains(event.target as Node)
			) {
				setShowInterestsDropdown(false);
				setInterestSearchQuery(""); // Clear search when closing
			}
			if (
				rangeFiltersRef.current &&
				!rangeFiltersRef.current.contains(event.target as Node)
			) {
				setShowRangeFilters(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Focus search input when dropdown opens
	useEffect(() => {
		if (showInterestsDropdown && interestSearchInputRef.current) {
			interestSearchInputRef.current.focus();
		}
	}, [showInterestsDropdown]);

	// Notify parent of filter changes
	useEffect(() => {
		onFilterChange({
			sortBy,
			selectedInterests,
			ranges: {
				age: ageRange,
				location: locationRange,
				fame: fameRange,
			},
		});
	}, [sortBy, selectedInterests, ageRange, locationRange, fameRange, onFilterChange]);

	const handleSortChange = (option: SortOptionType) => {
		setSortBy(option);
		// Close dropdown only when selecting "none"
		if (option === "none") {
			setShowSortDropdown(false);
		}
	};

	const toggleInterest = (interest: string) => {
		setSelectedInterests((prev) =>
			prev.includes(interest)
				? prev.filter((i) => i !== interest)
				: [...prev, interest]
		);
	};

	const addCustomInterest = () => {
		const trimmedQuery = interestSearchQuery.trim();
		if (trimmedQuery && !selectedInterests.includes(trimmedQuery)) {
			setSelectedInterests((prev) => [...prev, trimmedQuery]);
			setInterestSearchQuery("");
		}
	};

	const handleInterestSearchKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			const trimmedQuery = interestSearchQuery.trim();
			if (trimmedQuery) {
				// Check if it matches an existing interest (case-insensitive)
				const matchingInterest = findMatchingInterest(
					interestSearchQuery,
					filteredAvailableInterests
				);
				if (matchingInterest) {
					toggleInterest(matchingInterest);
				} else {
					addCustomInterest();
				}
			}
		}
	};

	// Filter available interests based on search query
	const filteredAvailableInterests = filterInterests(
		availableInterests,
		interestSearchQuery
	);

	// Check if search query would create a new custom interest
	const customInterest = checkCustomInterest(
		interestSearchQuery,
		availableInterests
	);

	const clearFilters = () => {
		setSortBy("none");
		setSelectedInterests([]);
		setInterestSearchQuery("");
		setAgeRange([18, 99]);
		setLocationRange([2, 40]);
		setFameRange([0, 1000]);
	};

	// Toggle sort: none → asc → desc → none
	const toggleSort = (category: "age" | "location" | "fame") => {
		const nextOption = getNextSortOption(sortBy, category);
		handleSortChange(nextOption);
	};

	const activeFilters = checkActiveFilters(
		sortBy,
		selectedInterests,
		ageRange,
		locationRange,
		fameRange
	);

	const activeRangeFilters = checkActiveRangeFilters(
		ageRange,
		locationRange,
		fameRange
	);

	return (
		<Stack direction="row" spacing="md" wrap className="mb-6">
			{/* Sort Dropdown */}
			<div className="relative" ref={sortDropdownRef}>
				<Button
					variant={sortBy !== "none" ? "primary" : "outline"}
					size="small"
					onClick={() => setShowSortDropdown(!showSortDropdown)}
					className="flex items-center gap-2 w-[156px] justify-between"
				>
					<Icon name="sort" className="w-4 h-4" />
					{getSortLabel(sortBy)}
					<Icon
						name={showSortDropdown ? "chevron-up" : "chevron-down"}
						className="w-4 h-4 ml-auto"
					/>
				</Button>

				{showSortDropdown && (
					<Dropdown className="w-56 py-1">
						<ToggleSortOption
							label="Âge"
							state={getSortState(sortBy, "age")}
							onClick={() => toggleSort("age")}
						/>
						<ToggleSortOption
							label="Distance"
							state={getSortState(sortBy, "location")}
							onClick={() => toggleSort("location")}
						/>
						<ToggleSortOption
							label="Popularité"
							state={getSortState(sortBy, "fame")}
							onClick={() => toggleSort("fame")}
						/>
						<DropdownDivider />
						<SortOption
							label="Aucun tri"
							isActive={sortBy === "none"}
							onClick={() => handleSortChange("none")}
						/>
					</Dropdown>
				)}
			</div>

			{/* Interests Dropdown */}
			<div className="relative" ref={interestsDropdownRef}>
				<Button
					variant={selectedInterests.length > 0 ? "primary" : "outline"}
					size="small"
					onClick={() => setShowInterestsDropdown(!showInterestsDropdown)}
					className="flex items-center gap-2 w-[140px] justify-between"
				>
					<Stack direction="row" spacing="sm" align="center">
						<Icon name="tag" className="w-4 h-4" />
						<span>Intérêts</span>
					</Stack>
					<Icon
						name={showInterestsDropdown ? "chevron-up" : "chevron-down"}
						className="w-4 h-4"
					/>
				</Button>

				{showInterestsDropdown && (
					<Dropdown className="w-72 max-h-96 overflow-hidden">
						{/* Search Input */}
						<div className="sticky top-0 p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
							<div className="relative">
								<TextField
									ref={interestSearchInputRef}
									type="text"
									value={interestSearchQuery}
									onChange={(e) => setInterestSearchQuery(e.target.value)}
									onKeyDown={handleInterestSearchKeyDown}
									placeholder="Rechercher ou créer..."
									className="pr-8 text-sm border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
									fullWidth={false}
								/>
								<Icon
									name="search"
									className="absolute right-2.5 top-3.5 w-4 h-4 text-gray-400"
								/>
							</div>
						</div>

						{/* Interests List */}
						<div className="overflow-y-auto max-h-80 py-1">
							{filteredAvailableInterests.length > 0 ? (
								filteredAvailableInterests.map((interest) => (
									<InterestOption
										key={interest}
										label={interest}
										isSelected={selectedInterests.includes(interest)}
										onClick={() => toggleInterest(interest)}
									/>
								))
							) : interestSearchQuery.trim() ? (
								<div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
									Aucun intérêt trouvé
								</div>
							) : (
								<div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
									Aucun intérêt disponible
								</div>
							)}

							{/* Add Custom Interest Option */}
							{customInterest && (
								<>
									<DropdownDivider />
									<button
										onClick={addCustomInterest}
										className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium"
									>
										<Icon name="plus" className="w-4 h-4" />
										Ajouter "{interestSearchQuery.trim()}"
									</button>
								</>
							)}
						</div>

						{/* Selected Interests Summary */}
						{selectedInterests.length > 0 && (
							<div className="sticky bottom-0 px-3 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
								<Stack direction="row" spacing="xs" wrap>
									{selectedInterests.slice(0, 3).map((interest) => (
										<Badge key={interest} variant="primary" size="small">
											<Stack direction="row" spacing="xs" align="center">
												{interest}
												<button
													onClick={(e) => {
														e.stopPropagation();
														toggleInterest(interest);
													}}
													className="hover:text-indigo-900 dark:hover:text-indigo-100"
												>
													<Icon name="close" className="w-3 h-3" />
												</button>
											</Stack>
										</Badge>
									))}
									{selectedInterests.length > 3 && (
										<span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-0.5">
											+{selectedInterests.length - 3} plus
										</span>
									)}
								</Stack>
							</div>
						)}
					</Dropdown>
				)}
			</div>

			{/* Range Filters Dropdown */}
			<div className="relative" ref={rangeFiltersRef}>
				<Button
					variant={activeRangeFilters ? "primary" : "outline"}
					size="small"
					onClick={() => setShowRangeFilters(!showRangeFilters)}
					className="flex items-center gap-2 w-[120px] justify-between"
				>
					<Stack direction="row" spacing="sm" align="center">
						<Icon name="filter" className="w-4 h-4" />
						<span>Filtres</span>
					</Stack>
					<Icon
						name={showRangeFilters ? "chevron-up" : "chevron-down"}
						className="w-4 h-4"
					/>
				</Button>

				{showRangeFilters && (
					<Dropdown className="w-80 p-4">
						<Stack spacing="lg">
							{/* Age Range Slider */}
							<RangeSlider
								min={18}
								max={99}
								value={ageRange}
								onChange={setAgeRange}
								label="Âge"
								unit=" ans"
							/>

							{/* Location Range Slider */}
							<RangeSlider
								min={2}
								max={40}
								value={locationRange}
								onChange={setLocationRange}
								label="Distance"
								unit=" km"
							/>

							{/* Fame Range Slider */}
							<RangeSlider
								min={0}
								max={1000}
								step={10}
								value={fameRange}
								onChange={setFameRange}
								label="Popularité"
								formatValue={(val) => val.toString()}
							/>

							{/* Reset Ranges Button */}
							{activeRangeFilters && (
								<div className="pt-2 border-t border-gray-200 dark:border-gray-700">
									<button
										onClick={() => {
											setAgeRange([18, 99]);
											setLocationRange([2, 40]);
											setFameRange([0, 1000]);
										}}
										className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
									>
										Réinitialiser les filtres
									</button>
								</div>
							)}
						</Stack>
					</Dropdown>
				)}
			</div>

			{/* Clear Filters Button */}
			{activeFilters && (
				<Button
					variant="outline"
					size="small"
					onClick={clearFilters}
					className="text-red-600 dark:text-red-400 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
				>
					<Icon name="close" className="w-4 h-4 mr-1" />
					Effacer les filtres
				</Button>
			)}
		</Stack>
	);
}
