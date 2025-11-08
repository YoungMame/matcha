import { ReactNode } from "react";

type BadgeVariant = "primary" | "secondary" | "success" | "warning" | "error" | "info";
type BadgeSize = "small" | "medium" | "large";

interface BadgeProps {
	variant?: BadgeVariant;
	size?: BadgeSize;
	children: ReactNode;
	className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
	primary: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300",
	secondary: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
	success: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
	warning: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
	error: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
	info: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
};

const sizeStyles: Record<BadgeSize, string> = {
	small: "px-2 py-0.5 text-xs",
	medium: "px-3 py-1 text-sm",
	large: "px-4 py-1.5 text-base",
};

export default function Badge({
	variant = "primary",
	size = "medium",
	className = "",
	children,
}: BadgeProps) {
	const classes = [
		"inline-flex items-center justify-center",
		"rounded-full",
		"font-medium",
		variantStyles[variant],
		sizeStyles[size],
		className,
	]
		.filter(Boolean)
		.join(" ");

	return <span className={classes}>{children}</span>;
}
