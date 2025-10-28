"use client";

import { useState } from "react";
import TextField from "@/components/common/TextField";

interface SearchBarProps {
	onSearch?: (query: string) => void;
	placeholder?: string;
}

export default function SearchBar({
	onSearch,
	placeholder = "Rechercher...",
}: SearchBarProps) {
	const [query, setQuery] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSearch?.(query);
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="relative max-w-2xl mx-auto mb-6"
		>
			<div className="relative ">
				<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
					<svg
						className="h-5 w-5 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
				</div>
				<TextField
					type="text"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder={placeholder}
					fullWidth
					className="pl-12 rounded-full! bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-lg border-gray-300 dark:border-gray-600"
				/>
			</div>
		</form>
	);
}
