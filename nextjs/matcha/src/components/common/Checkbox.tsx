import Icon from "./Icon";

interface CheckboxProps {
	checked?: boolean;
	onChange?: (checked: boolean) => void;
	label?: string;
	className?: string;
}

export default function Checkbox({
	checked = false,
	onChange,
	label,
	className = "",
}: CheckboxProps) {
	const handleClick = () => {
		onChange?.(!checked);
	};

	return (
		<div
			className={`flex items-center gap-3 cursor-pointer ${className}`}
			onClick={handleClick}
		>
			<div
				className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
					checked
						? "bg-indigo-600 border-indigo-600"
						: "border-gray-300 dark:border-gray-600"
				}`}
			>
				{checked && <Icon name="check" className="w-3 h-3 text-white" />}
			</div>
			{label && (
				<span
					className={
						checked
							? "text-indigo-600 dark:text-indigo-400 font-medium"
							: "text-gray-700 dark:text-gray-300"
					}
				>
					{label}
				</span>
			)}
		</div>
	);
}
