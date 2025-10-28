interface IconProps {
	name: "chevron-left" | "chevron-right" | "check";
	className?: string;
}

export default function Icon({ name, className = "w-5 h-5" }: IconProps) {
	const icons = {
		"chevron-left": (
			<svg
				className={className}
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M15 19l-7-7 7-7"
				/>
			</svg>
		),
		"chevron-right": (
			<svg
				className={className}
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M9 5l7 7-7 7"
				/>
			</svg>
		),
		check: (
			<svg
				className={className}
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M5 13l4 4L19 7"
				/>
			</svg>
		),
	};

	return icons[name];
}
