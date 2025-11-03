"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import TextField from "@/components/common/TextField";
import RangeSlider from "@/components/common/RangeSlider";
import Badge from "@/components/common/Badge";
import Icon from "@/components/common/Icon";
import Stack from "@/components/common/Stack";
import { Dropdown, DropdownDivider } from "@/components/common/Dropdown";
import Typography from "@/components/common/Typography";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import Grid from "@/components/common/Grid";

interface SearchCriteria {
	ageRange: [number, number];
	fameRange: [number, number];
	locationRange: [number, number];
	interests: string[];
}

interface SearchBarProps {
	onSearch?: (criteria: SearchCriteria) => void;
	placeholder?: string;
	availableInterests?: string[];
	initialCriteria?: SearchCriteria;
}

export default function SearchBar({
	onSearch,
	placeholder = "Rechercher un match qui ...",
	availableInterests = [],
	initialCriteria,
}: SearchBarProps) {
	const router = useRouter();
	const [isExpanded, setIsExpanded] = useState(false);
	const [ageRange, setAgeRange] = useState<[number, number]>(
		initialCriteria?.ageRange || [18, 99]
	);
	const [fameRange, setFameRange] = useState<[number, number]>(
		initialCriteria?.fameRange || [0, 1000]
	);
	const [locationRange, setLocationRange] = useState<[number, number]>(
		initialCriteria?.locationRange || [2, 40]
	);
	const [selectedInterests, setSelectedInterests] = useState<string[]>(
		initialCriteria?.interests || []
	);
	const [interestSearchQuery, setInterestSearchQuery] = useState("");
	const [showInterestSuggestions, setShowInterestSuggestions] = useState(false);
	
	const containerRef = useRef<HTMLDivElement>(null);
	const interestInputRef = useRef<HTMLInputElement>(null);
	const interestDropdownRef = useRef<HTMLDivElement>(null);

	// Sync with initialCriteria when it changes (from URL params)
	useEffect(() => {
		if (initialCriteria) {
			setAgeRange(initialCriteria.ageRange);
			setFameRange(initialCriteria.fameRange);
			setLocationRange(initialCriteria.locationRange);
			setSelectedInterests(initialCriteria.interests);
		}
	}, [initialCriteria]);

	// Close when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setIsExpanded(false);
			}
			if (
				interestDropdownRef.current &&
				!interestDropdownRef.current.contains(event.target as Node)
			) {
				setShowInterestSuggestions(false);
			}
		};

		if (isExpanded || showInterestSuggestions) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isExpanded, showInterestSuggestions]);

	const handleSearchFieldClick = () => {
		setIsExpanded(true);
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

	const handleInterestKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			const trimmedQuery = interestSearchQuery.trim();
			if (trimmedQuery) {
				const matchingInterest = availableInterests.find(
					(interest) => interest.toLowerCase() === trimmedQuery.toLowerCase()
				);
				if (matchingInterest) {
					toggleInterest(matchingInterest);
				} else {
					addCustomInterest();
				}
				setInterestSearchQuery("");
			}
		}
	};

	const handleInterestFocus = () => {
		setShowInterestSuggestions(true);
	};

	const handleInterestBlur = () => {
		// Don't use blur to close - let click outside handle it
	};

	const filteredInterests = availableInterests.filter((interest) =>
		interest.toLowerCase().includes(interestSearchQuery.toLowerCase())
	);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		
		// Build URL search params
		const params = new URLSearchParams();
		params.set('ageMin', ageRange[0].toString());
		params.set('ageMax', ageRange[1].toString());
		params.set('fameMin', fameRange[0].toString());
		params.set('fameMax', fameRange[1].toString());
		params.set('distanceMin', locationRange[0].toString());
		params.set('distanceMax', locationRange[1].toString());
		
		if (selectedInterests.length > 0) {
			params.set('interests', selectedInterests.join(','));
		}
		
		// Call optional callback
		onSearch?.({
			ageRange,
			fameRange,
			locationRange,
			interests: selectedInterests,
		});
		
		// Update current page URL with params instead of redirecting
		router.push(`/browsing?${params.toString()}`, { scroll: false });
		setIsExpanded(false);
	};

	// Build natural language display text
	const buildDisplayText = () => {
		const parts: string[] = [];
		
		// Check if criteria have been modified from defaults
		const hasAgeCriteria = ageRange[0] !== 18 || ageRange[1] !== 99;
		const hasLocationCriteria = locationRange[0] !== 2 || locationRange[1] !== 40;
		const hasFameCriteria = fameRange[0] !== 0 || fameRange[1] !== 1000;
		const hasInterestCriteria = selectedInterests.length > 0;

		if (!hasAgeCriteria && !hasLocationCriteria && !hasFameCriteria && !hasInterestCriteria) {
			return "";
		}

		if (hasAgeCriteria) {
			parts.push(`a entre ${ageRange[0]} et ${ageRange[1]} ans`);
		}

		if (hasLocationCriteria) {
			parts.push(`habite entre ${locationRange[0]} et ${locationRange[1]} km`);
		}

		if (hasFameCriteria) {
			parts.push(`a une popularité entre ${fameRange[0]} et ${fameRange[1]}`);
		}

		if (hasInterestCriteria) {
			parts.push(`s'intéresse à ${selectedInterests.join(", ")}`);
		}

		if (parts.length === 0) {
			return "";
		}

		// Join parts with ", " except for the last one which uses " et qui "
		if (parts.length === 1) {
			return `Rechercher un match qui ${parts[0]}.`;
		}

		const lastPart = parts[parts.length - 1];
		const otherParts = parts.slice(0, -1);
		return `Rechercher un match qui ${otherParts.join(", qui ")} et qui ${lastPart}.`;
	};

	const displayText = buildDisplayText();
	const hasActiveCriteria = displayText !== "";

	return (
		<div ref={containerRef} className="relative max-w-2xl mx-auto mb-6">
			<form onSubmit={handleSubmit}>
				{/* Search Input Field */}
				<div className="relative">
					<div className={`absolute left-0 pl-4 flex items-center pointer-events-none z-10 ${hasActiveCriteria ? 'top-4' : 'inset-y-0'}`}>
						<Icon name="search" className="h-5 w-5 text-gray-400" />
					</div>
					<div
						onClick={handleSearchFieldClick}
						className={`pl-12 pr-4 py-3 rounded-full cursor-pointer bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-lg border border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors ${
							hasActiveCriteria ? 'min-h-12' : ''
						}`}
					>
						{displayText ? (
							<Typography variant="small" className="leading-relaxed wrap-break-word">
								{displayText}
							</Typography>
						) : (
							<Typography variant="small" color="secondary">
								{placeholder}
							</Typography>
						)}
					</div>
				</div>

				{/* Expanded Criteria Panel */}
				{isExpanded && (
					<Card 
						variant="elevated" 
						padding="md"
						className="absolute z-50 mt-2 w-full rounded-2xl"
					>
						<Stack spacing="lg">
							{/* Age and Fame Range - Side by Side */}
							<Grid cols={2} gap="lg">
								<RangeSlider
									min={18}
									max={99}
									value={ageRange}
									onChange={setAgeRange}
									label="Âge"
									unit=" ans"
								/>
								<RangeSlider
									min={0}
									max={1000}
									step={10}
									value={fameRange}
									onChange={setFameRange}
									label="Popularité"
									formatValue={(val) => val.toString()}
								/>
							</Grid>

							{/* Location Range - Same width as above sliders */}
							<Grid cols={2} gap="lg">
								<RangeSlider
									min={2}
									max={40}
									value={locationRange}
									onChange={setLocationRange}
									label="Distance"
									unit=" km"
								/>
								<div></div>
							</Grid>

							{/* Interests */}
							<div>
								<Typography variant="small" bold className="mb-2">
									Intérêts
								</Typography>
								
								{/* Interest Search Input */}
								<div className="relative" ref={interestDropdownRef}>
									<TextField
										ref={interestInputRef}
										type="text"
										value={interestSearchQuery}
										onChange={(e) => setInterestSearchQuery(e.target.value)}
										onKeyDown={handleInterestKeyDown}
										onFocus={handleInterestFocus}
										onBlur={handleInterestBlur}
										placeholder="Rechercher ou ajouter un intérêt..."
										className="pr-8 text-sm"
										fullWidth
									/>
									<Icon
										name="search"
										className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none"
									/>

									{/* Interest Suggestions Dropdown */}
									{showInterestSuggestions && (
										<Dropdown className="w-full max-h-60 overflow-hidden">
											<div className="overflow-y-auto max-h-60">
												{filteredInterests.length > 0 ? (
													filteredInterests.map((interest) => (
														<Button
															key={interest}
															type="button"
															onClick={() => {
																toggleInterest(interest);
																setInterestSearchQuery("");
															}}
															variant="secondary"
															size="small"
															fullWidth
															className={`justify-start! rounded-none! text-sm transition-colors ${
																selectedInterests.includes(interest)
																	? "bg-indigo-50! dark:bg-indigo-900/30! text-indigo-600! dark:text-indigo-400!"
																	: "text-gray-700! dark:text-gray-300! hover:bg-gray-100! dark:hover:bg-gray-700!"
															}`}
														>
															{interest}
														</Button>
													))
												) : interestSearchQuery.trim() ? (
													<>
														<Typography variant="small" color="secondary" className="px-3 py-2">
															Aucun intérêt trouvé
														</Typography>
														<DropdownDivider />
														<Button
															type="button"
															onClick={() => {
																addCustomInterest();
															}}
															variant="secondary"
															size="small"
															fullWidth
															className="justify-start! rounded-none! text-indigo-600 dark:text-indigo-400 hover:bg-gray-100! dark:hover:bg-gray-700!"
														>
															<Stack direction="row" spacing="xs" align="center">
																<Icon name="plus" className="w-4 h-4" />
																Ajouter "{interestSearchQuery.trim()}"
															</Stack>
														</Button>
													</>
												) : (
													<Typography variant="small" color="secondary" className="px-3 py-2">
														Aucun intérêt disponible
													</Typography>
												)}
											</div>
										</Dropdown>
									)}
								</div>

								{/* Selected Interests */}
								{selectedInterests.length > 0 && (
									<div className="mt-3">
										<Stack direction="row" spacing="xs" wrap>
											{selectedInterests.map((interest) => (
												<Badge key={interest} variant="primary" size="small">
													<Stack direction="row" spacing="xs" align="center">
														{interest}
														<button
															type="button"
															onClick={() => toggleInterest(interest)}
															className="hover:text-indigo-900 dark:hover:text-indigo-100"
														>
															<Icon name="close" className="w-3 h-3" />
														</button>
													</Stack>
												</Badge>
											))}
										</Stack>
									</div>
								)}
							</div>

							{/* Action Buttons */}
							<div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
								<Button
									type="button"
									onClick={() => {
										setAgeRange([18, 99]);
										setFameRange([0, 1000]);
										setLocationRange([2, 40]);
										setSelectedInterests([]);
										// Clear URL params
										router.push('/browsing', { scroll: false });
									}}
									variant="secondary"
									size="small"
								>
									Réinitialiser
								</Button>
								<Button
									type="submit"
									variant="primary"
									size="small"
								>
									Rechercher
								</Button>
							</div>
						</Stack>
					</Card>
				)}
			</form>
		</div>
	);
}
