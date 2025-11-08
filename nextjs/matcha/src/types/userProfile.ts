export type UserProfile = {
  id: string;
  username?: string;
  firstName: string;
  lastName: string;
  birthday: string;
  biography: string;
  interests: string[];
  fame: number;
  distance: number;
  gender: string;
  interestedInGenders: string[];
  profilePicture: string | null;
  additionalPictures: (string | null)[];
};
