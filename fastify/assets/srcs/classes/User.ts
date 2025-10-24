export type Location = {
    latitude: number;
    longitude: number;
    updatedAt: Date;
}

export default class User {
    id: number;
    email: string;
    private passwordHash: string;
    username: string;
    profilePictureIndex: number;
    profilePictures: string[];
    gallery: string[];
    bio: string;
    tags: string[];
    born_at: Date;
    isVerified: boolean;
    gender: 'men' | 'women';
    orientation: 'heterosexual' | 'homosexual' | 'bisexual';
    location: Location | null;

    constructor(
        id: number,
        email: string,
        passwordHash: string,
        username: string, 
        profilePictureIndex: number,
        profilePictures: string[],
        gallery: string[] = [],
        bio: string = '',
        tags: string[] = [],
        born_at: Date = new Date(),
        isVerified: boolean = false,
        gender: 'men' | 'women' = 'men',
        orientation: 'heterosexual' | 'homosexual' | 'bisexual' = 'bisexual',
        location: Location | null = null
    ) {
        this.id = id;
        this.email = email;
        this.passwordHash = passwordHash;
        this.username = username;
        this.profilePictureIndex = profilePictureIndex;
        this.profilePictures = profilePictures;
        this.gallery = gallery;
        this.bio = bio;
        this.tags = tags;
        this.born_at = born_at;
        this.isVerified = isVerified;
        this.gender = gender;
        this.orientation = orientation;
        this.location = location;
    }

    get profilePicture(): string {
        if (this.profilePictures.length === 0)
            return '';
        const profilePicture = this.profilePictures[this.profilePictureIndex];
        if (!profilePicture)
            return '';
        return profilePicture;
    };
}