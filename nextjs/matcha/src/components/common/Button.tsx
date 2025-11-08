import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "gradient";
type ButtonSize = "small" | "medium" | "large";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	fullWidth?: boolean;
	children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
	primary: "bg-indigo-600 text-white border-transparent",
	secondary: "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700",
	outline: "bg-white text-gray-700 border-gray-300",
	gradient: "bg-gradient-to-r from-pink-500 to-orange-400 text-white border-transparent",
};

const variantHoverStyles: Record<ButtonVariant, string> = {
	primary: "hover:bg-indigo-700",
	secondary: "hover:bg-gray-50 dark:hover:bg-gray-700",
	outline: "hover:bg-gray-50",
	gradient: "hover:from-pink-600 hover:to-orange-500",
};

const sizeStyles: Record<ButtonSize, string> = {
	small: "px-4 py-2 text-sm",
	medium: "px-6 py-3 text-base",
	large: "px-8 py-4 text-lg",
};

export default function Button({
	variant = "primary",
	size = "medium",
	fullWidth = false,
	className = "",
	children,
	disabled = false,
	...props
}: ButtonProps) {
	const classes = [
		"inline-flex items-center justify-center",
		"font-medium rounded-md",
		"border transition-all",
		"focus:outline-none focus:ring-2 focus:ring-offset-2",
		variant === "gradient" ? "rounded-full focus:ring-pink-500" : "focus:ring-indigo-500",
		variantStyles[variant],
		!disabled && variantHoverStyles[variant],
		sizeStyles[size],
		fullWidth && "w-full",
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
