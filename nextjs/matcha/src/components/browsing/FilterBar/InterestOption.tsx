import Checkbox from "@/components/common/Checkbox";

interface InterestOptionProps {
	label: string;
	isSelected: boolean;
	onClick: () => void;
}

export default function InterestOption({
	label,
	isSelected,
	onClick,
}: InterestOptionProps) {
	return (
		<button
			onClick={onClick}
			className={`w-full text-left px-4 py-2 text-sm transition-colors ${
				isSelected
					? "bg-indigo-50 dark:bg-indigo-900/30"
					: "hover:bg-gray-100 dark:hover:bg-gray-700"
			}`}
		>
			<Checkbox checked={isSelected} label={label} />
		</button>
	);
}
