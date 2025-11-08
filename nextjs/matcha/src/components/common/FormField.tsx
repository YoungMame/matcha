import { InputHTMLAttributes, forwardRef } from "react";
import TextField from "./TextField";

interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
	label?: string;
	error?: string;
	helperText?: string;
	fullWidth?: boolean;
	showError?: boolean;
}

/**
 * FormField - Enhanced TextField with better error state management
 * Wraps TextField and adds additional form-specific functionality
 */
const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
	(
		{
			error,
			showError = true,
			...props
		},
		ref
	) => {
		return (
			<TextField
				ref={ref}
				error={showError ? error : undefined}
				{...props}
			/>
		);
	}
);

FormField.displayName = "FormField";

export default FormField;
