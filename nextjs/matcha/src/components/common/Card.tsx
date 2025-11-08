import { ReactNode } from "react";

type CardPadding = "none" | "sm" | "md" | "lg";
type CardVariant = "default" | "outlined" | "elevated";

interface CardProps {
	children: ReactNode;
	className?: string;
	padding?: CardPadding;
	variant?: CardVariant;
}

const paddingStyles: Record<CardPadding, string> = {
	none: "",
	sm: "p-4",
	md: "p-6",
	lg: "p-8",
};

const variantStyles: Record<CardVariant, string> = {
	default: "bg-white dark:bg-gray-800",
	outlined: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
	elevated: "bg-white dark:bg-gray-800 shadow-lg",
};

export default function Card({
	children,
	className = "",
	padding = "lg",
	variant = "elevated",
}: CardProps) {
	const classes = [
		variantStyles[variant],
		paddingStyles[padding],
		"rounded-lg",
		className,
	]
		.filter(Boolean)
		.join(" ");

	return <div className={classes}>{children}</div>;
}
