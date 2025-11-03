import { ReactNode } from "react";

interface DropdownProps {
	children: ReactNode;
	className?: string;
}

export function Dropdown({ children, className = "" }: DropdownProps) {
	return (
		<div
			className={`absolute z-50 mt-2 rounded-lg bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 ${className}`}
		>
			{children}
		</div>
	);
}

interface DropdownItemProps {
	onClick: () => void;
	isActive?: boolean;
	children: ReactNode;
	className?: string;
}

export function DropdownItem({
	onClick,
	isActive = false,
	children,
	className = "",
}: DropdownItemProps) {
	return (
		<button
			onClick={onClick}
			className={`w-full text-left px-4 py-2 text-sm transition-colors ${
				isActive
					? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
					: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
			} ${className}`}
		>
			{children}
		</button>
	);
}

interface DropdownDividerProps {
	className?: string;
}

export function DropdownDivider({ className = "" }: DropdownDividerProps) {
	return (
		<div
			className={`border-t border-gray-200 dark:border-gray-700 my-1 ${className}`}
		/>
	);
}
