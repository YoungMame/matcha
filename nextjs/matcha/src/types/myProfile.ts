export type MyProfile = {
  id: number;
  email: string;
  username: string;
  profilePictureIndex?: number;
  profilePictures: string[];
  bio: string;
  tags: string[];
  bornAt: string;
  gender: 'male' | 'female';
  orientation: 'heterosexual' | 'homosexual' | 'bisexual';
  isVerified: boolean;
  isProfileCompleted: boolean;
  location: {
    latitude: number | null;
    longitude: number | null;
    city: string | null;
    country: string | null;
  };
  createdAt: string;
};
