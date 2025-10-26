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
		// TODO: Implement API call to submit onboarding data
		console.log('Submitting onboarding data:', data);

		// Placeholder for future API implementation
		// try {
		//   const response = await fetch('/api/onboarding', {
		//     method: 'POST',
		//     headers: { 'Content-Type': 'application/json' },
		//     body: JSON.stringify(data),
		//   });
		//   if (!response.ok) throw new Error('Failed to submit');
		//   return await response.json();
		// } catch (error) {
		//   console.error('Error submitting onboarding:', error);
		//   throw error;
		// }
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
