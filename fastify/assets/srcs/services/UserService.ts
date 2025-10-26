import fastify from '../app';
import PasswordManager from "../utils/password";
import User from "../classes/User";
import { insert, findByEmail, findById, remove, update } from "../models/User";
import fp from 'fastify-plugin';
import path from 'path';
import fs from 'fs';

class UserService {

    UsersCache: Map<number, User>;

    constructor() {
        this.UsersCache = new Map<number, User>();
    }

    private async sendVerificationEmail(user: User): Promise<void> {
        // Implementation for sending verification email
        const codeLenght = 6;
        let codeArray: number[] = [];
        for (let i = 0; i < codeLenght; i++)
            codeArray[i] = Math.random() * 10 - 1; // give a digit
            
        const code = codeArray.map(digit => digit.toString()).join('');
        const seconds = 600
        console.log(`Sending verification email to ${user.email} for user ID ${user.id} with code ${code}, available for ${600 / 60} minutes`);
        user.setEmailCode("emailValidation", seconds, code);
    }

    private async getUser(idOrMail: string | number): Promise<User | null> {
        let userdata: undefined;
        if (typeof idOrMail == 'string')
            userdata = await findByEmail(idOrMail);
        else
            userdata = await findById(idOrMail);
        if (!userdata)
            return (null);
        return (User.fromRow(userdata));
    }

    async createUser(email: string, password: string, username: string, born_at: Date, gender: string, orientation: string): Promise<string | undefined> {
        if (!(email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)))
            return (undefined);
        if (!(username.match(/^[a-zA-Z0-9._\- ]+$/)))
            return (undefined);
        const hashedPassword = await PasswordManager.hashPassword(password);
        const row = await insert(email, hashedPassword, username, born_at, gender, orientation);
        const userId = row.id;
        const user = await this.getUser(userId);
        if (!user)
            return (await remove(userId), undefined)
        const jwt = await fastify.jwt.sign({ id: userId, email: email, username: username });
        this.sendVerificationEmail(user);
        return (jwt);
    }

    async login(email: string, password: string) {
        const user = await this.getUser(email);
        if (!user) return (undefined);
        const isValid = await PasswordManager.compare(password, user.passwordHash);
        if (!isValid) return (undefined);
        const jwt = await fastify.jwt.sign({ id: user.id, email: user.email, username: user.username });
        return (jwt);
    }

    async verifyEmail(id: number): Promise<void> {
        const user = await this.getUser(id);
        if (!user) return;
        user.clearEmailCode("emailValidation");
    }

    async updateUserLocation(id: number, latitude: number, longitude: number): Promise<void> {
        const user = await this.getUser(id);
        if (!user) return;
        await update(id, {}, { latitude, longitude });
    }

    async updateUserProfile(id: number, profile: { bio?: string, tags?: string[], gender?: string, orientation?: string, bornAt?: Date }): Promise<void> {
        const user = await this.getUser(id);
        if (!user) return;
        Object.entries(profile).forEach(([key, value]) => {
            if (value !== undefined) {
                (user as any)[key] = value;
            }
        });
        await update(id, profile);
    }

    async updateUserProfilePicture(id: number, pictureIndex: number): Promise<void> {
        const user = await this.getUser(id);
        if (!user) return;
        user.profilePictureIndex = pictureIndex;
        await update(id, { profilePictureIndex: pictureIndex });
    }

    async addUserProfilePicture(id: number, pictureFile: File, pictureMimeType: string): Promise<void> {
        const user = await this.getUser(id);
        if (!user) return;

        const picturesDir = path.join(__dirname, '..', '..', 'assets', 'uploads', id.toString());
        if (!fs.existsSync(picturesDir)) {
            fs.mkdirSync(picturesDir, { recursive: true });
        }

        const pictureId = user.profilePictures.length;
    }
}

export default fp(async (fastify) => {
    fastify.decorate('userService', UserService);
});
