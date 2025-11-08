import { ReactNode } from "react";
import Typography from "./Typography";

type AlertVariant = "error" | "warning" | "info" | "success";

interface AlertProps {
	variant?: AlertVariant;
	children: ReactNode;
	className?: string;
}

const variantStyles: Record<AlertVariant, { bg: string; border: string; color: "error" | "primary" | "secondary" }> = {
	error: {
		bg: "bg-red-50 dark:bg-red-900/20",
		border: "border-red-200 dark:border-red-800",
		color: "error",
	},
	warning: {
		bg: "bg-yellow-50 dark:bg-yellow-900/20",
		border: "border-yellow-200 dark:border-yellow-800",
		color: "primary",
	},
	info: {
		bg: "bg-blue-50 dark:bg-blue-900/20",
		border: "border-blue-200 dark:border-blue-800",
		color: "primary",
	},
	success: {
		bg: "bg-green-50 dark:bg-green-900/20",
		border: "border-green-200 dark:border-green-800",
		color: "primary",
	},
};

export default function Alert({
	variant = "info",
	children,
	className = ""
}: AlertProps) {
	const styles = variantStyles[variant];

	return (
		<div className={`p-4 rounded-md border ${styles.bg} ${styles.border} ${className}`}>
			<Typography variant="small" color={styles.color}>
				{children}
			</Typography>
		</div>
	);
}
