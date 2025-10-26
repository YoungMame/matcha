'use client';

import Typography from '@/components/common/Typography';
import { GENDER_OPTIONS } from '@/constants/onboarding';

interface PreferencesStepProps {
	gender: string;
	interestedInGenders: string[];
	onChange: (field: 'gender' | 'interestedInGenders', value: string | string[]) => void;
	showValidation?: boolean;
}

export default function PreferencesStep({
	gender,
	interestedInGenders,
	onChange,
	showValidation = false,
}: PreferencesStepProps) {
	const toggleInterestedGender = (genderValue: string) => {
		if (interestedInGenders.includes(genderValue)) {
			onChange(
				'interestedInGenders',
				interestedInGenders.filter((g) => g !== genderValue)
			);
		} else {
			onChange('interestedInGenders', [...interestedInGenders, genderValue]);
		}
	};

	const hasGenderError = showValidation && !gender;
	const hasInterestedInError = showValidation && interestedInGenders.length === 0;

	return (
		<div className="space-y-8">
			{/* Gender Selection */}
			<div>
				<label className="block mb-1">
					<Typography variant="body" bold className="mb-2">
						What is your gender?
					</Typography>
				</label>
				{hasGenderError && (
					<Typography variant="small" color="error" className="mb-2">
						Please select your gender
					</Typography>
				)}
				<select
					value={gender}
					onChange={(e) => onChange('gender', e.target.value)}
					className={`
						w-full px-4 py-3
						border rounded-md
						transition-all
						focus:outline-none focus:ring-2 focus:border-transparent
						${hasGenderError
							? 'border-red-500 focus:ring-red-500'
							: 'border-gray-300 focus:ring-pink-500'
						}
					`}
				>
					<option value="">Select your gender</option>
					{GENDER_OPTIONS.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
			</div>

			{/* Interested In Gender Selection */}
			<div>
				<Typography variant="body" bold className="mb-2">
					Who would you like to date?
				</Typography>
				<Typography variant="small" color="secondary" className="mb-2">
					You can select multiple options
				</Typography>
				{hasInterestedInError && (
					<Typography variant="small" color="error" className="mb-2">
						Please select at least one option
					</Typography>
				)}
				<div className="space-y-2">
					{GENDER_OPTIONS.map((option) => (
						<label
							key={option.value}
							className={`
								flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer
								transition-all
								${interestedInGenders.includes(option.value)
									? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
									: hasInterestedInError
										? 'border-red-300 dark:border-red-700 hover:border-pink-300 dark:hover:border-pink-700'
										: 'border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-700'
								}
							`}
						>
							<input
								type="checkbox"
								value={option.value}
								checked={interestedInGenders.includes(option.value)}
								onChange={() => toggleInterestedGender(option.value)}
								className="w-5 h-5 text-pink-500 focus:ring-pink-500 rounded"
							/>
							<Typography variant="body">{option.label}</Typography>
						</label>
					))}
				</div>
			</div>
		</div>
	);
}
