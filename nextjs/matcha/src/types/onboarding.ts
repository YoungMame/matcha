export type OnboardingData = {
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
  profilePictureSettings: {
    rotation: number;
    crop: { x: number; y: number; width: number; height: number };
  };
  additionalPicturesSettings: {
    rotation: number;
    crop: { x: number; y: number; width: number; height: number };
  }[];
};

export type OnboardingStep =
  | "identity"
  | "interests"
  | "preferences"
  | "pictures";

export type StepConfig = {
  id: OnboardingStep;
  label: string;
  title: string;
  description: string;
};
