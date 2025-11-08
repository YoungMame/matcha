import { ReactNode, ElementType } from "react";

type StackDirection = "row" | "column";
type StackAlign = "start" | "center" | "end" | "stretch";
type StackJustify = "start" | "center" | "end" | "between" | "around" | "evenly";
type StackSpacing = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

interface StackProps {
	direction?: StackDirection;
	align?: StackAlign;
	justify?: StackJustify;
	spacing?: StackSpacing;
	wrap?: boolean;
	fullWidth?: boolean;
	as?: ElementType;
	children: ReactNode;
	className?: string;
}

const alignStyles: Record<StackAlign, string> = {
	start: "items-start",
	center: "items-center",
	end: "items-end",
	stretch: "items-stretch",
};

const justifyStyles: Record<StackJustify, string> = {
	start: "justify-start",
	center: "justify-center",
	end: "justify-end",
	between: "justify-between",
	around: "justify-around",
	evenly: "justify-evenly",
};

const spacingStyles: Record<StackDirection, Record<StackSpacing, string>> = {
	row: {
		none: "gap-0",
		xs: "gap-1",
		sm: "gap-2",
		md: "gap-4",
		lg: "gap-6",
		xl: "gap-8",
		"2xl": "gap-12",
	},
	column: {
		none: "gap-0",
		xs: "gap-1",
		sm: "gap-2",
		md: "gap-4",
		lg: "gap-6",
		xl: "gap-8",
		"2xl": "gap-12",
	},
};

export default function Stack({
	direction = "column",
	align = "stretch",
	justify = "start",
	spacing = "md",
	wrap = false,
	fullWidth = false,
	as: Component = "div",
	className = "",
	children,
}: StackProps) {
	const classes = [
		"flex",
		direction === "row" ? "flex-row" : "flex-col",
		alignStyles[align],
		justifyStyles[justify],
		spacingStyles[direction][spacing],
		wrap && "flex-wrap",
		fullWidth && "w-full",
		className,
	]
		.filter(Boolean)
		.join(" ");

	return <Component className={classes}>{children}</Component>;
}
