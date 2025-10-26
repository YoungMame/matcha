import { StepConfig } from '@/types/onboarding';

export const STEPS: StepConfig[] = [
	{
		id: 'identity',
		label: 'Identity',
		title: 'Tell us about yourself',
		description: 'Let\'s start with the basics',
	},
	{
		id: 'interests',
		label: 'Interests',
		title: 'What are your interests?',
		description: 'Select at least 3 interests that describe you',
	},
	{
		id: 'preferences',
		label: 'Sexual Preferences',
		title: 'Who would you like to meet?',
		description: 'Help us find your perfect match',
	},
	{
		id: 'pictures',
		label: 'Pictures',
		title: 'Add your photos',
		description: 'Show your best self',
	},
];

export const AVAILABLE_INTERESTS = [
	'Photography',
	'Hiking',
	'Cooking',
	'Reading',
	'Traveling',
	'Music',
	'Dancing',
	'Sports',
	'Yoga',
	'Gaming',
	'Art',
	'Movies',
	'Fitness',
	'Pets',
	'Fashion',
	'Technology',
	'Writing',
	'Gardening',
	'Cycling',
	'Swimming',
	'Running',
	'Meditation',
	'Wine',
	'Coffee',
	'Theatre',
	'Comedy',
	'Languages',
	'Volunteering',
];

export const GENDER_OPTIONS = [
	{ value: 'male', label: 'Male' },
	{ value: 'female', label: 'Female' },
	{ value: 'non-binary', label: 'Non-binary' },
	{ value: 'other', label: 'Other' },
];

export const MIN_INTERESTS = 3;
export const MAX_ADDITIONAL_PICTURES = 4;
