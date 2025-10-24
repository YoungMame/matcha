export type Location = {
    latitude: number;
    longitude: number;
    updatedAt: Date;
}

export type EmailCode = {
    validUntil: Date;
    code: string | number;
}

export default class User {
    id: number;
    email: string;
    passwordHash: string;
    username: string;
    profilePictureIndex: number;
    profilePictures: string[];
    gallery: string[];
    bio: string;
    tags: string[];
    bornAt: Date;
    isVerified: boolean;
    gender: 'men' | 'women';
    orientation: 'heterosexual' | 'homosexual' | 'bisexual';
    location: Location | undefined;
    emailValidation: EmailCode | undefined;
    dfaValidation: EmailCode | undefined;
    passwordResetValidation: EmailCode | undefined;

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
        bornAt: Date = new Date(),
        isVerified: boolean = false,
        gender: 'men' | 'women' = 'men',
        orientation: 'heterosexual' | 'homosexual' | 'bisexual' = 'bisexual',
        location: Location | undefined = undefined
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
        this.bornAt = bornAt;
        this.isVerified = isVerified;
        this.gender = gender;
        this.orientation = orientation;
        this.location = location;
    }

    static fromRow(row: any): User {
        return new User(
            row.id,
            row.email,
            row.password_hash,
            row.username,
            row.profile_picture_index,
            row.profile_pictures,
            row.gallery,
            row.bio,
            row.tags,
            new Date(row.born_at),
            row.is_verified,
            row.gender,
            row.orientation,
            row.location
        );
    }

    get profilePicture(): string {
        if (this.profilePictures.length === 0)
            return '';
        const profilePicture = this.profilePictures[this.profilePictureIndex];
        if (!profilePicture)
            return '';
        return profilePicture;
    };

    setEmailCode(
        kind: "emailValidation" | "dfaValidation" | "passwordResetValidation",
        seconds: number,
        value: string | number
    ) {
        const validUntil = new Date(Date.now() + seconds * 1000);
        const codeObj: EmailCode = {
            validUntil,
            code: value,
        };
        (this)[kind] = codeObj;
    }

    getEmailCode (
        kind: "emailValidation" | "dfaValidation" | "passwordResetValidation"
    ) {
        const obj = (this)[kind];
        if (obj != undefined && obj.validUntil > new Date(Date.now()))
            return (obj.code);
        return (undefined);
    }
}