import { ReactNode } from "react";

type TypographyVariant = "h1" | "h2" | "h3" | "body" | "small" | "caption";
type TypographyColor = "primary" | "secondary" | "white" | "error";
type TypographyAlign = "left" | "center" | "right";

interface TypographyProps {
	variant?: TypographyVariant;
	color?: TypographyColor;
	align?: TypographyAlign;
	bold?: boolean;
	className?: string;
	children: ReactNode;
}

const variantStyles: Record<TypographyVariant, string> = {
	h1: "text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight",
	h2: "text-2xl font-bold",
	h3: "text-xl font-bold",
	body: "text-base",
	small: "text-sm",
	caption: "text-xs",
};

const colorStyles: Record<TypographyColor, string> = {
	primary: "text-gray-900 dark:text-white",
	secondary: "text-gray-600 dark:text-gray-400",
	white: "text-white",
	error: "text-red-600",
};

const alignStyles: Record<TypographyAlign, string> = {
	left: "text-left",
	center: "text-center",
	right: "text-right",
};

export default function Typography({
	variant = "body",
	color = "primary",
	align = "left",
	bold = false,
	className = "",
	children,
}: TypographyProps) {
	const Component = variant.startsWith("h") ? variant : "p";

	const classes = [
		variantStyles[variant],
		colorStyles[color],
		alignStyles[align],
		bold && "font-bold",
		className,
	]
		.filter(Boolean)
		.join(" ");

	return <Component className={classes}>{children}</Component>;
}
