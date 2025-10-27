import PasswordManager from "../utils/password";
import User from "../classes/User";
import UserModel from "../models/User";
import fp from 'fastify-plugin';
import path from 'path';
import fs from 'fs';
import { FastifyInstance } from 'fastify';

class UserService {
    private fastify: FastifyInstance;
    private userModel: UserModel;
    UsersCache: Map<number, User>;

    constructor(fastify: FastifyInstance) {
        this.fastify = fastify;
        this.userModel = new UserModel(fastify);
        this.UsersCache = new Map<number, User>();
    }

    private async sendVerificationEmail(user: User): Promise<void> {
        // Implementation for sending verification email
        const codeLenght = 6;
        let codeArray: number[] = [];
        for (let i = 0; i < codeLenght; i++)
            codeArray[i] = Math.random() * 10 - 1; // give a digit

        const code = codeArray.map(digit => Math.round(digit).toString()).join('');
        const seconds = 600
        console.log(`Sending verification email to ${user.email} for user ID ${user.id} with code ${code}, available for ${600 / 60} minutes`);
        user.setEmailCode("emailValidation", seconds, code);
    }

    private async getUser(idOrMail: string | number): Promise<User | null> {
        let userdata: undefined;
        if (typeof idOrMail == 'string')
            userdata = await this.userModel.findByEmail(idOrMail);
        else
            userdata = await this.userModel.findById(idOrMail);
        if (!userdata)
            return (null);
        return (User.fromRow(userdata));
    }

    async createUser(email: string, password: string, username: string, bornAt: Date, gender: string, orientation: string): Promise<string | undefined> {
        if (!(email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)))
            return (undefined);
        if (!(username.match(/^[a-zA-Z0-9._\- ]+$/)))
            return (undefined);
        const hashedPassword = await PasswordManager.hashPassword(password);
        const userId = await this.userModel.insert(email, hashedPassword, username, bornAt, gender, orientation);
        console.log('userId', userId);
        const user = await this.getUser(userId);
        if (!user)
            return (await this.userModel.remove(userId), undefined)
        const jwt = await this.fastify.jwt.sign({ id: userId, email: email, username: username });
        this.sendVerificationEmail(user);
        return (jwt);
    }

    async login(email: string, password: string) {
        const user = await this.getUser(email);
        if (!user) return (undefined);
        const isValid = await PasswordManager.compare(password, user.passwordHash);
        if (!isValid) return (undefined);
        const jwt = await this.fastify.jwt.sign({ id: user.id, email: user.email, username: user.username });
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
        await this.userModel.update(id, {}, { latitude, longitude });
    }

    async updateUserProfile(id: number, profile: { bio?: string, tags?: string[], gender?: string, orientation?: string, bornAt?: Date }): Promise<void> {
        const user = await this.getUser(id);
        if (!user) return;
        Object.entries(profile).forEach(([key, value]) => {
            if (value !== undefined) {
                (user as any)[key] = value;
            }
        });
        await this.userModel.update(id, profile);
    }

    async updateUserProfilePicture(id: number, pictureIndex: number): Promise<boolean> {
        const user = await this.getUser(id);
        if (!user)
            return (false);
        if (user.profilePictures.length <= pictureIndex)
            return (false);

        user.profilePictureIndex = pictureIndex;
        await this.userModel.update(id, { profilePictureIndex: pictureIndex });
        return (true);
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

export default fp(async (fastify: FastifyInstance) => {
    const userService = new UserService(fastify);
    fastify.decorate('userService', userService);
});
