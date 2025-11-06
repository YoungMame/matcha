import { useState, useCallback } from 'react';
import { OnboardingData, OnboardingStep } from '@/types/onboarding';
import { STEPS, MIN_INTERESTS } from '@/constants/onboarding';

const initialData: OnboardingData = {
	firstName: '',
	lastName: '',
	birthday: '',
	biography: '',
	interests: [],
	gender: '',
	interestedInGenders: [],
	profilePicture: null,
	additionalPictures: [null, null, null, null],
};

export const useOnboarding = () => {
	const [currentStepIndex, setCurrentStepIndex] = useState(0);
	const [data, setData] = useState<OnboardingData>(initialData);

	const currentStep = STEPS[currentStepIndex];

	const updateData = useCallback((updates: Partial<OnboardingData>) => {
		setData((prev) => ({ ...prev, ...updates }));
	}, []);

	const nextStep = useCallback(() => {
		if (currentStepIndex < STEPS.length - 1) {
			setCurrentStepIndex((prev) => prev + 1);
		}
	}, [currentStepIndex]);

	const previousStep = useCallback(() => {
		if (currentStepIndex > 0) {
			setCurrentStepIndex((prev) => prev - 1);
		}
	}, [currentStepIndex]);

	const goToStep = useCallback((stepIndex: number) => {
		if (stepIndex >= 0 && stepIndex < STEPS.length) {
			setCurrentStepIndex(stepIndex);
		}
	}, []);

	const isStepValid = useCallback(
		(stepId: OnboardingStep): boolean => {
			switch (stepId) {
				case 'identity':
					return !!(
						data.firstName.trim() &&
						data.lastName.trim() &&
						data.birthday &&
						data.biography.trim() &&
						data.biography.trim().length >= 50
					);
				case 'interests':
					return data.interests.length >= MIN_INTERESTS;
				case 'preferences':
					return !!(data.gender && data.interestedInGenders.length > 0);
				case 'pictures':
					return !!data.profilePicture;
				default:
					return false;
			}
		},
		[data]
	);

	const isCurrentStepValid = isStepValid(currentStep.id);

	const isStepCompleted = useCallback(
		(stepIndex: number): boolean => {
			return isStepValid(STEPS[stepIndex].id);
		},
		[isStepValid]
	);

	const allStepsCompleted = STEPS.every((step) => isStepValid(step.id));

	const completedStepsCount = STEPS.filter((step) => isStepValid(step.id)).length;

	const submitOnboarding = async () => {
		try {
			// Step 1: Upload profile picture (required)
			if (data.profilePicture) {
				const formData = new FormData();
				formData.append('file', data.profilePicture);
				
				await fetch('/api/private/user/me/profile-picture', {
					method: 'POST',
					body: formData,
				});
			}

			// Step 2: Upload additional pictures
			// for (const picture of data.additionalPictures) {
			// 	if (picture) {
			// 		const formData = new FormData();
			// 		formData.append('file', picture);
					
			// 		await fetch('/api/private/user/me/profile-picture', {
			// 			method: 'POST',
			// 			body: formData,
			// 		});
			// 	}
			// }

			// Step 3: Update profile with onboarding data
			const profileData = {
				bio: data.biography,
				tags: data.interests,
				gender: data.gender.toLowerCase(), // Ensure lowercase to match backend enum
				orientation: data.interestedInGenders.length === 2 
					? 'bisexual' 
					: data.interestedInGenders[0] === data.gender 
						? 'homosexual' 
						: 'heterosexual',
				bornAt: new Date(data.birthday).toISOString(),
			};

			const response = await fetch('/api/private/user/me/profile', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(profileData),
			});

			if (!response.ok) {
				const error = await response.json();
				console.error('Failed to submit onboarding:', error);
				throw new Error(error.message || 'Failed to submit onboarding');
			}

			return await response.json();
		} catch (error) {
			console.error('Error submitting onboarding:', error);
			throw error;
		}
	};

	return {
		currentStep,
		currentStepIndex,
		data,
		updateData,
		nextStep,
		previousStep,
		goToStep,
		isCurrentStepValid,
		isStepCompleted,
		allStepsCompleted,
		completedStepsCount,
		submitOnboarding,
	};
};
