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
    bio: string;
    tags: string[];
    bornAt: Date;
    isVerified: boolean;
    gender: 'men' | 'women';
    orientation: 'heterosexual' | 'homosexual' | 'bisexual';
    location: Location | undefined;
    createdAt: Date;

    static emailValidations: Map<number, EmailCode> = new Map<number, EmailCode>();
    static dfaValidations: Map<number, EmailCode> = new Map<number, EmailCode>();
    static passwordResetValidations: Map<number, EmailCode> = new Map<number, EmailCode>();

    constructor(
        id: number,
        email: string,
        passwordHash: string,
        username: string, 
        profilePictureIndex: number,
        profilePictures: string[],
        bio: string = '',
        tags: string[] = [],
        bornAt: Date,
        isVerified: boolean = false,
        gender: 'men' | 'women' = 'men',
        orientation: 'heterosexual' | 'homosexual' | 'bisexual' = 'bisexual',
        location: Location | undefined = undefined,
        createdAt: Date,
    ) {
        this.id = id;
        this.email = email;
        this.passwordHash = passwordHash;
        this.username = username;
        this.profilePictureIndex = profilePictureIndex;
        this.profilePictures = profilePictures;
        this.bio = bio;
        this.tags = tags;
        this.bornAt = bornAt;
        this.isVerified = isVerified;
        this.gender = gender;
        this.orientation = orientation;
        this.location = location;
        this.createdAt = createdAt;
    }

    static fromRow(row: any): User {
        return new User(
            row.id,
            row.email,
            row.password_hash,
            row.username,
            row.profile_picture_index,
            row.profile_pictures,
            row.bio,
            row.tags,
            new Date(row.born_at),
            row.is_verified,
            row.gender,
            row.orientation,
            row.location,
            new Date(row.created_at)
        );
    }

    get profilePicture(): string {
        if (!this.profilePictures || this.profilePictures.length === 0)
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
        if (kind === "emailValidation")
            User.emailValidations.set(this.id, codeObj);
        else if (kind === "dfaValidation")
            User.dfaValidations.set(this.id, codeObj);
        else if (kind === "passwordResetValidation")
            User.passwordResetValidations.set(this.id, codeObj);
    }

    getEmailCode(kind: "emailValidation" | "dfaValidation" | "passwordResetValidation") {
        let obj: EmailCode | undefined;
        if (kind === "emailValidation")
            obj = User.emailValidations.get(this.id);
        else if (kind === "dfaValidation")
            obj = User.dfaValidations.get(this.id);
        else if (kind === "passwordResetValidation")
            obj = User.passwordResetValidations.get(this.id);
        if (obj != undefined && obj.validUntil > new Date(Date.now()))
            return (obj.code);
        return (undefined);
    }

    clearEmailCode(kind: "emailValidation" | "dfaValidation" | "passwordResetValidation") {
        if (kind === "emailValidation")
            User.emailValidations.delete(this.id);
        else if (kind === "dfaValidation")
            User.dfaValidations.delete(this.id);
        else if (kind === "passwordResetValidation")
            User.passwordResetValidations.delete(this.id);
    }
}