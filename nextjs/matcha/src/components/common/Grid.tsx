import { ReactNode } from "react";

type GridCols = 1 | 2 | 3 | 4 | 6 | 12;
type GridGap = "none" | "sm" | "md" | "lg" | "xl";

interface GridProps {
	cols?: GridCols;
	mdCols?: GridCols;
	lgCols?: GridCols;
	gap?: GridGap;
	children: ReactNode;
	className?: string;
}

const colsStyles: Record<GridCols, string> = {
	1: "grid-cols-1",
	2: "grid-cols-2",
	3: "grid-cols-3",
	4: "grid-cols-4",
	6: "grid-cols-6",
	12: "grid-cols-12",
};

const mdColsStyles: Record<GridCols, string> = {
	1: "md:grid-cols-1",
	2: "md:grid-cols-2",
	3: "md:grid-cols-3",
	4: "md:grid-cols-4",
	6: "md:grid-cols-6",
	12: "md:grid-cols-12",
};

const lgColsStyles: Record<GridCols, string> = {
	1: "lg:grid-cols-1",
	2: "lg:grid-cols-2",
	3: "lg:grid-cols-3",
	4: "lg:grid-cols-4",
	6: "lg:grid-cols-6",
	12: "lg:grid-cols-12",
};

const gapStyles: Record<GridGap, string> = {
	none: "gap-0",
	sm: "gap-4",
	md: "gap-6",
	lg: "gap-8",
	xl: "gap-12",
};

export default function Grid({
	cols = 1,
	mdCols,
	lgCols,
	gap = "md",
	children,
	className = "",
}: GridProps) {
	const classes = [
		"grid",
		colsStyles[cols],
		mdCols && mdColsStyles[mdCols],
		lgCols && lgColsStyles[lgCols],
		gapStyles[gap],
		className,
	]
		.filter(Boolean)
		.join(" ");

	return <div className={classes}>{children}</div>;
}
