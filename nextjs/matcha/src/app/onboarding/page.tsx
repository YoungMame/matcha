"use client";

import { useState } from "react";
import { useOnboarding } from "@/hooks/useOnboarding";
import { STEPS } from "@/constants/onboarding";
import StepIndicator from "@/components/onboarding/StepIndicator";
import ProgressBar from "@/components/onboarding/ProgressBar";
import Typography from "@/components/common/Typography";
import Button from "@/components/common/Button";
import Stack from "@/components/common/Stack";
import Icon from "@/components/common/Icon";
import Container from "@/components/common/Container";
import Card from "@/components/common/Card";
import Grid from "@/components/common/Grid";
import Alert from "@/components/common/Alert";
import IdentityStep from "@/components/onboarding/steps/IdentityStep";
import InterestsStep from "@/components/onboarding/steps/InterestsStep";
import PreferencesStep from "@/components/onboarding/steps/PreferencesStep";
import PicturesStep from "@/components/onboarding/steps/PicturesStep";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
	const router = useRouter();
	const [showValidation, setShowValidation] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

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

		setIsSubmitting(true);
		setSubmitError(null);

		try {
			await submitOnboarding();
			console.log("Onboarding submitted successfully");
			router.push("/browsing");
		} catch (error: any) {
			console.error("Failed to submit onboarding:", error);
			setSubmitError(
				error?.response?.data?.error || 
				error?.message || 
				"Une erreur est survenue lors de la soumission. Veuillez réessayer."
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleStepClick = (stepIndex: number) => {
		setShowValidation(false);
		goToStep(stepIndex);
	};

	const renderStepContent = () => {
		switch (currentStep.id) {
			case "identity":
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
			case "interests":
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
			case "preferences":
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
			case "pictures":
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
		<div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 py-8">
			<Container size="lg">
				<Grid cols={1} lgCols={3} gap="lg">
					<div className="lg:col-span-1">
						<div className="lg:sticky lg:top-8">
							<Stack spacing="lg" direction="column">
								<ProgressBar
									completedSteps={completedStepsCount}
									totalSteps={STEPS.length}
								/>

								<StepIndicator
									steps={STEPS}
									currentStepIndex={currentStepIndex}
									isStepCompleted={isStepCompleted}
									onStepClick={handleStepClick}
								/>
							</Stack>
						</div>
					</div>

					<div className="lg:col-span-2">
						<Card padding="lg" variant="elevated">
							<Stack spacing="lg" direction="column">
								<Stack spacing="sm" direction="column">
									<Typography variant="h2">
										{currentStep.title}
									</Typography>
									<Typography variant="body" color="secondary">
										{currentStep.description}
									</Typography>
								</Stack>

								<div>{renderStepContent()}</div>

								{submitError && (
									<Alert variant="error">
										{submitError}
									</Alert>
								)}

								<Stack
									direction="row"
									justify="between"
									align="center"
									className="pt-6 border-t border-gray-200 dark:border-gray-700"
								>
									<Button
										variant="outline"
										onClick={previousStep}
										disabled={currentStepIndex === 0}
									>
										<Icon name="chevron-left" className="w-5 h-5 mr-2" />
										Précédent
									</Button>

									{currentStepIndex < STEPS.length - 1 ? (
										<Button variant="gradient" onClick={handleNext}>
											Suivant
											<Icon name="chevron-right" className="w-5 h-5 ml-2" />
										</Button>
									) : (
										<Button
											variant="gradient"
											onClick={handleSubmit}
											disabled={!allStepsCompleted || isSubmitting}
										>
											{isSubmitting ? "Envoi en cours..." : "Terminer l'inscription"}
											<Icon name="check" className="w-5 h-5 ml-2" />
										</Button>
									)}
								</Stack>
							</Stack>
						</Card>
					</div>
				</Grid>
			</Container>
		</div>
	);
}
