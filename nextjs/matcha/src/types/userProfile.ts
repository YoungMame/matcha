export type UserProfile = {
  id: string;
  username?: string;
  firstName: string;
  lastName: string;
  birthday: string;
  biography: string;
  interests: string[];
  gender: string;
  interestedInGenders: string[];
  profilePicture: string | null;
  additionalPictures: (string | null)[];
};
