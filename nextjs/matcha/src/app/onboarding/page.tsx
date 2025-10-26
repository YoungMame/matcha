'use client';

import { useState } from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { STEPS } from '@/constants/onboarding';
import StepIndicator from '@/components/onboarding/StepIndicator';
import ProgressBar from '@/components/onboarding/ProgressBar';
import Typography from '@/components/common/Typography';
import Button from '@/components/common/Button';
import IdentityStep from '@/components/onboarding/steps/IdentityStep';
import InterestsStep from '@/components/onboarding/steps/InterestsStep';
import PreferencesStep from '@/components/onboarding/steps/PreferencesStep';
import PicturesStep from '@/components/onboarding/steps/PicturesStep';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
	const router = useRouter();
	const [showValidation, setShowValidation] = useState(false);

	const {
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
	} = useOnboarding();

	const handleFieldChange = (field: string, value: any) => {
		updateData({ [field]: value });
		// Reset validation when user makes changes
		if (showValidation) {
			setShowValidation(false);
		}
	};

	const handleNext = () => {
		if (isCurrentStepValid) {
			setShowValidation(false);
			nextStep();
		} else {
			setShowValidation(true);
		}
	};

	const handleSubmit = async () => {
		if (!allStepsCompleted) {
			setShowValidation(true);
			return;
		}

		try {
			await submitOnboarding();
			// TODO: Navigate to dashboard after successful submission
			router.push('/dashboard');
		} catch (error) {
			console.error('Failed to submit onboarding:', error);
			// TODO: Show error message to user
		}
	};

	const handleStepClick = (stepIndex: number) => {
		setShowValidation(false);
		goToStep(stepIndex);
	};

	const renderStepContent = () => {
		switch (currentStep.id) {
			case 'identity':
				return (
					<IdentityStep
						firstName={data.firstName}
						lastName={data.lastName}
						birthday={data.birthday}
						biography={data.biography}
						onChange={handleFieldChange}
						showValidation={showValidation}
					/>
				);
			case 'interests':
				return (
					<InterestsStep
						interests={data.interests}
						onChange={(interests) => {
							updateData({ interests });
							if (showValidation) {
								setShowValidation(false);
							}
						}}
						showValidation={showValidation}
					/>
				);
			case 'preferences':
				return (
					<PreferencesStep
						gender={data.gender}
						interestedInGenders={data.interestedInGenders}
						onChange={(field, value) => {
							updateData({ [field]: value });
							if (showValidation) {
								setShowValidation(false);
							}
						}}
						showValidation={showValidation}
					/>
				);
			case 'pictures':
				return (
					<PicturesStep
						profilePicture={data.profilePicture}
						additionalPictures={data.additionalPictures}
						onChange={(field, value) => {
							updateData({ [field]: value });
							if (showValidation) {
								setShowValidation(false);
							}
						}}
						showValidation={showValidation}
					/>
				);
			default:
				return null;
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
			<div className="max-w-7xl mx-auto">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Left Column - Step Indicator with Progress Bar */}
					<div className="lg:col-span-1">
						<div className="lg:sticky lg:top-8">
							{/* Progress Bar */}
							<div className="mb-6">
								<ProgressBar
									completedSteps={completedStepsCount}
									totalSteps={STEPS.length}
								/>
							</div>

							{/* Step Indicator */}
							<StepIndicator
								steps={STEPS}
								currentStepIndex={currentStepIndex}
								isStepCompleted={isStepCompleted}
								onStepClick={handleStepClick}
							/>
						</div>
					</div>

					{/* Right Column - Step Content */}
					<div className="lg:col-span-2">
						<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
							{/* Step Header */}
							<div className="mb-8">
								<Typography variant="h2" className="mb-2">
									{currentStep.title}
								</Typography>
								<Typography variant="body" color="secondary">
									{currentStep.description}
								</Typography>
							</div>

							{/* Step Content */}
							<div className="mb-8">{renderStepContent()}</div>

							{/* Navigation Buttons */}
							<div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
								<Button
									variant="outline"
									onClick={previousStep}
									disabled={currentStepIndex === 0}
								>
									<svg
										className="w-5 h-5 mr-2"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M15 19l-7-7 7-7"
										/>
									</svg>
									Previous
								</Button>

								{currentStepIndex < STEPS.length - 1 ? (
									<Button
										variant="gradient"
										onClick={handleNext}
									>
										Next
										<svg
											className="w-5 h-5 ml-2"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9 5l7 7-7 7"
											/>
										</svg>
									</Button>
								) : (
									<Button
										variant="gradient"
										onClick={handleSubmit}
										disabled={!allStepsCompleted}
									>
										Complete Onboarding
										<svg
											className="w-5 h-5 ml-2"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M5 13l4 4L19 7"
											/>
										</svg>
									</Button>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}