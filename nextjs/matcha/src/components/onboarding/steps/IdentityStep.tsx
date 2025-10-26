'use client';

import TextField from '@/components/common/TextField';
import Typography from '@/components/common/Typography';
import DatePicker from '@/components/common/DatePicker';

interface IdentityStepProps {
	firstName: string;
	lastName: string;
	birthday: string;
	biography: string;
	onChange: (field: string, value: string) => void;
	showValidation?: boolean;
}

export default function IdentityStep({
	firstName,
	lastName,
	birthday,
	biography,
	onChange,
	showValidation = false,
}: IdentityStepProps) {
	// Calculate max date (18 years ago)
	const maxDate = new Date();
	maxDate.setFullYear(maxDate.getFullYear() - 18);
	const maxDateString = maxDate.toISOString().split('T')[0];

	// Calculate min date (120 years ago)
	const minDate = new Date();
	minDate.setFullYear(minDate.getFullYear() - 120);
	const minDateString = minDate.toISOString().split('T')[0];

	const hasFirstNameError = showValidation && !firstName.trim();
	const hasLastNameError = showValidation && !lastName.trim();
	const hasBirthdayError = showValidation && !birthday;
	const hasBiographyError = showValidation && (!biography.trim() || biography.trim().length < 50);

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<TextField
					label="First Name"
					value={firstName}
					onChange={(e) => onChange('firstName', e.target.value)}
					placeholder="Enter your first name"
					required
					error={hasFirstNameError ? 'First name is required' : undefined}
				/>
				<TextField
					label="Last Name"
					value={lastName}
					onChange={(e) => onChange('lastName', e.target.value)}
					placeholder="Enter your last name"
					required
					error={hasLastNameError ? 'Last name is required' : undefined}
				/>
			</div>

			<DatePicker
				label="Birthday"
				value={birthday}
				onChange={(date) => onChange('birthday', date)}
				max={maxDateString}
				min={minDateString}
				required
				error={hasBirthdayError ? 'Birthday is required' : undefined}
				helperText={!hasBirthdayError ? "You must be at least 18 years old" : undefined}
			/>

			<div>
				<label className="block mb-1">
					<Typography variant="small" bold>
						Biography
					</Typography>
				</label>
				<textarea
					value={biography}
					onChange={(e) => onChange('biography', e.target.value)}
					placeholder="Tell us about yourself..."
					rows={6}
					className={`
						w-full px-4 py-3
						border rounded-md
						transition-all
						focus:outline-none focus:ring-2 focus:border-transparent
						resize-none
						${hasBiographyError
							? 'border-red-500 focus:ring-red-500'
							: 'border-gray-300 focus:ring-pink-500'
						}
					`}
					required
				/>
				<div className="mt-1 ml-1 flex justify-between items-start">
					<Typography
						variant="caption"
						color={hasBiographyError ? "error" : "secondary"}
					>
						{hasBiographyError
							? biography.trim().length === 0
								? 'Biography is required'
								: `Minimum 50 characters required (${biography.trim().length}/50)`
							: 'Minimum 50 characters'
						}
					</Typography>
					<Typography variant="caption" color="secondary">
						{biography.length} / 500
					</Typography>
				</div>
			</div>
		</div>
	);
}
