"use client";

import { useState } from "react";
import TextField from "@/components/common/TextField";
import Typography from "@/components/common/Typography";
import { AVAILABLE_INTERESTS, MIN_INTERESTS } from "@/constants/onboarding";

interface InterestsStepProps {
	interests: string[];
	onChange: (interests: string[]) => void;
	showValidation?: boolean;
}

export default function InterestsStep({
	interests,
	onChange,
	showValidation = false,
}: InterestsStepProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [customInterest, setCustomInterest] = useState("");

	const filteredInterests = AVAILABLE_INTERESTS.filter((interest) =>
		interest.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const toggleInterest = (interest: string) => {
		if (interests.includes(interest)) {
			onChange(interests.filter((i) => i !== interest));
		} else {
			onChange([...interests, interest]);
		}
	};

	const addCustomInterest = () => {
		const trimmed = customInterest.trim();
		if (trimmed && !interests.includes(trimmed)) {
			onChange([...interests, trimmed]);
			setCustomInterest("");
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			addCustomInterest();
		}
	};

	const removeInterest = (interest: string) => {
		onChange(interests.filter((i) => i !== interest));
	};

	const hasError = showValidation && interests.length < MIN_INTERESTS;

	return (
		<div className="space-y-6">
			<Typography
				variant="small"
				color={hasError ? "error" : "secondary"}
				bold={hasError}
			>
				{hasError
					? `Veuillez sélectionner au moins ${MIN_INTERESTS} centres d'intérêt (actuellement ${interests.length})`
					: `Sélectionnés : ${interests.length} / ${MIN_INTERESTS} minimum`}
			</Typography>

			{/* Selected Interests */}
			{interests.length > 0 && (
				<div>
					<Typography variant="small" bold className="mb-2">
						Vos centres d'intérêt
					</Typography>
					<div className="flex flex-wrap gap-2">
						{interests.map((interest) => (
							<button
								key={interest}
								onClick={() => removeInterest(interest)}
								className="
									inline-flex items-center gap-2
									px-4 py-2 rounded-full
									bg-pink-500 text-white
									hover:bg-pink-600
									transition-all
								"
							>
								<span>{interest}</span>
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						))}
					</div>
				</div>
			)}

			{/* Search */}
			<TextField
				label="Rechercher des centres d'intérêt"
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
				placeholder="Recherchez des centres d'intérêt..."
			/>

			{/* Available Interests */}
			<div>
				<Typography variant="small" bold className="mb-2">
					Centres d'intérêt disponibles
				</Typography>
				<div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-lg">
					{filteredInterests.length > 0 ? (
						filteredInterests.map((interest) => (
							<button
								key={interest}
								onClick={() => toggleInterest(interest)}
								disabled={interests.includes(interest)}
								className={`
									px-4 py-2 rounded-full
									transition-all
									${interests.includes(interest)
										? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
										: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-pink-100 dark:hover:bg-pink-900/30 cursor-pointer"
									}
								`}
							>
								{interest}
							</button>
						))
					) : (
						<Typography variant="small" color="secondary" className="p-4">
							Aucun centre d'intérêt trouvé. Essayez une autre recherche ou
							ajoutez un centre d'intérêt personnalisé ci-dessous.
						</Typography>
					)}
				</div>
			</div>

			{/* Add Custom Interest */}
			<div>
				<Typography variant="small" bold className="mb-2">
					Vous ne trouvez pas votre centre d'intérêt ?
				</Typography>
				<div className="flex gap-2">
					<TextField
						value={customInterest}
						onChange={(e) => {
							const value = e.target.value;
							if (value.length <= 20) {
								setCustomInterest(value);
							}
						}}
						onKeyPress={handleKeyPress}
						placeholder="Ajoutez un centre d'intérêt personnalisé..."
						fullWidth
					/>
					<button
						onClick={addCustomInterest}
						disabled={!customInterest.trim()}
						className={`
							px-6 py-3 rounded-md
							bg-pink-500 text-white
							disabled:opacity-50 disabled:cursor-not-allowed
							transition-all
							whitespace-nowrap
							${customInterest.trim() ? "hover:bg-pink-600" : ""}
						`}
					>
						Ajouter
					</button>
				</div>
				<Typography variant="caption" color="secondary" className="mt-1 ml-1">
					Maximum 20 caractères ({customInterest.length}/20)
				</Typography>
			</div>
		</div>
	);
}
