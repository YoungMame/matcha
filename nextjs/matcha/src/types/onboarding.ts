export interface OnboardingData {
	// Step 1: Identity
	firstName: string;
	lastName: string;
	birthday: string;
	biography: string;

	// Step 2: Interests
	interests: string[];

	// Step 3: Sexual Preferences
	gender: string;
	interestedInGenders: string[];

	// Step 4: Pictures
	profilePicture: File | null;
	additionalPictures: (File | null)[];
}

export type OnboardingStep = 'identity' | 'interests' | 'preferences' | 'pictures';

export interface StepConfig {
	id: OnboardingStep;
	label: string;
	title: string;
	description: string;
}
