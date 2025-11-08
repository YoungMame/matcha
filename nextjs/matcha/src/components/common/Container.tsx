import { ReactNode } from "react";

type ContainerSize = "sm" | "md" | "lg" | "xl" | "full";

interface ContainerProps {
	size?: ContainerSize;
	children: ReactNode;
	className?: string;
	padding?: boolean;
	centered?: boolean;
}

const sizeStyles: Record<ContainerSize, string> = {
	sm: "max-w-3xl",
	md: "max-w-5xl",
	lg: "max-w-7xl",
	xl: "max-w-screen-2xl",
	full: "max-w-full",
};

export default function Container({
	size = "lg",
	children,
	className = "",
	padding = true,
	centered = true,
}: ContainerProps) {
	const classes = [
		sizeStyles[size],
		centered && "mx-auto",
		padding && "px-4",
		className,
	]
		.filter(Boolean)
		.join(" ");

	return <div className={classes}>{children}</div>;
}
