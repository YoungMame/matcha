import { useState, useCallback } from 'react';
import { OnboardingData, OnboardingStep } from '@/types/onboarding';
import { STEPS, MIN_INTERESTS } from '@/constants/onboarding';
import { profileApi } from '@/lib/api/profile';
import { Fira_Sans_Extra_Condensed } from 'next/font/google';

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
	profilePictureSettings: {
		rotation: 0,
		crop: { x: 0, y: 0, width: 0, height: 0 },
	},
	additionalPicturesSettings: [],
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
						data.firstName.trim().length >= 1 && data.firstName.trim().length <= 50 &&
						data.lastName.trim().length >= 1 && data.lastName.trim().length <= 50 &&
						data.birthday &&
						data.biography.trim() &&
						data.biography.trim().length >= 50 && data.biography.trim().length <= 500 &&
						data.firstName.trim().match(/^[a-zA-Z-\']+$/) &&
						data.lastName.trim().match(/^[a-zA-Z-\']+$/)
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
				formData.append('rotation', data.profilePictureSettings.rotation.toString());
				formData.append('crop', JSON.stringify(data.profilePictureSettings.crop));
				
				await fetch('/api/private/user/me/profile-picture', {
					method: 'POST',
					body: formData,
				});
				// await profileApi.uploadProfilePicture(data.profilePicture);
			}

			for (const picture of data.additionalPictures) {
				if (picture) {
					const formData = new FormData();
					formData.append('file', picture);
					formData.append('rotation', data.additionalPicturesSettings[data.additionalPictures.indexOf(picture)].rotation.toString());
					formData.append('crop', JSON.stringify(data.additionalPicturesSettings[data.additionalPictures.indexOf(picture)].crop));
					
					await fetch('/api/private/user/me/profile-picture', {
						method: 'POST',
						body: formData,
					});
					// await profileApi.uploadProfilePicture(picture);
				}
			}

		// Map gender from UI values to backend enum ("men"/"women")
		const genderMap: Record<string, string> = {
			'Men': 'men',
			'Women': 'women',
			'male': 'men',
			'female': 'women',
			'men': 'men',
			'women': 'women',
		};

		// Step 3: Complete profile with onboarding data
		const profileData = {
			firstName: data.firstName,
			lastName: data.lastName,
			bio: data.biography,
			tags: data.interests,
			gender: (genderMap[data.gender] || data.gender) as 'men' | 'women',
			orientation: data.interestedInGenders.length === 2 
				? 'bisexual' as const
				: data.interestedInGenders.map(g => genderMap[g] || g).includes(genderMap[data.gender] || data.gender)
					? 'homosexual' as const
					: 'heterosexual' as const,
			bornAt: new Date(data.birthday).toISOString(),
		};		
			const response = await profileApi.completeProfile(profileData);

			await profileApi.updateProfile({
				location: {
					latitude: 48.8566,
					longitude: 2.3522
				}
			});


			if (!response) {
				// const error = await response.json();

				console.error('Failed to submit onboarding:');
				throw new Error( 'Failed to submit onboarding');
			}

			return response;
		} catch (error) {
			console.error("Failed to update default location:", error);
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
