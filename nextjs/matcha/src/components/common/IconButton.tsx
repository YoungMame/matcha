import { ButtonHTMLAttributes, ReactNode } from "react";

type IconButtonVariant = "primary" | "secondary" | "success" | "error" | "ghost";
type IconButtonSize = "small" | "medium" | "large";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: IconButtonVariant;
	size?: IconButtonSize;
	children: ReactNode;
}

const variantStyles: Record<IconButtonVariant, string> = {
	primary: "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-lg hover:scale-110",
	secondary: "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 shadow-lg hover:scale-110",
	success: "bg-white dark:bg-gray-800 text-green-500 shadow-lg hover:scale-110",
	error: "bg-white dark:bg-gray-800 text-red-500 shadow-lg hover:scale-110",
	ghost: "bg-black/50 hover:bg-black/70 text-white",
};

const sizeStyles: Record<IconButtonSize, string> = {
	small: "w-10 h-10 p-2",
	medium: "w-14 h-14 p-3",
	large: "w-16 h-16 p-4",
};

export default function IconButton({
	variant = "primary",
	size = "medium",
	className = "",
	children,
	disabled = false,
	...props
}: IconButtonProps) {
	const classes = [
		"inline-flex items-center justify-center",
		"rounded-full",
		"transition-all",
		"focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
		variantStyles[variant],
		sizeStyles[size],
		disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
		className,
	]
		.filter(Boolean)
		.join(" ");

	return (
		<button className={classes} disabled={disabled} {...props}>
			{children}
		</button>
	);
}
