import { InputHTMLAttributes, forwardRef } from "react";
import Typography from "./Typography";

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
	label?: string;
	error?: string;
	helperText?: string;
	fullWidth?: boolean;
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
	(
		{
			label,
			error,
			helperText,
			fullWidth = true,
			className = "",
			type = "text",
			...props
		},
		ref
	) => {
		return (
			<div className={fullWidth ? "w-full" : ""}>
				{label && (
					<label className="block mb-1">
						<Typography variant="small" bold>
							{label}
						</Typography>
					</label>
				)}
				<input
					ref={ref}
					type={type}
					className={`
						px-4 py-3 
						border rounded-md 
						transition-all
						focus:outline-none focus:ring-2 focus:border-transparent
						${error
							? "border-red-500 focus:ring-red-500"
							: "border-gray-300 focus:ring-pink-500"
						}
						${fullWidth ? "w-full" : ""}
						${className}
					`}
					{...props}
				/>
				{(error || helperText) && (
					<Typography
						variant="caption"
						color={error ? "error" : "secondary"}
						className="mt-1 ml-1"
					>
						{error || helperText}
					</Typography>
				)}
			</div>
		);
	}
);

TextField.displayName = "TextField";

export default TextField;
