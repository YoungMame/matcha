import PasswordManager from "../utils/password";
import User from "../classes/User";
import UserModel from "../models/User";
import fp from 'fastify-plugin';
import path from 'path';
import fs from 'fs';
import { FastifyInstance } from 'fastify';
import { UnauthorizedError, NotFoundError, BadRequestError, InternalServerError } from "../utils/error";

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
            throw new BadRequestError('Invalid email format');
        if (!(username.match(/^[a-zA-Z0-9._\- ]+$/)))
            throw new BadRequestError('Invalid username format');
        const hashedPassword = await PasswordManager.hashPassword(password);
        const userId = await this.userModel.insert(email, hashedPassword, username, bornAt, gender, orientation);
        const user = await this.getUser(userId);
        if (!user)
            throw new InternalServerError('User not found');
        const jwt = await this.fastify.jwt.sign({ id: userId, email: email, username: username });
        this.sendVerificationEmail(user);
        return (jwt);
    }

    async login(email: string, password: string) {
        const user = await this.getUser(email);
        if (!user)
            throw new UnauthorizedError();
        const isValid = await PasswordManager.compare(password, user.passwordHash);
        if (!isValid)
            throw new UnauthorizedError();
        const jwt = await this.fastify.jwt.sign({ id: user.id, email: user.email, username: user.username });
        return (jwt);
    }

    async verifyEmail(id: number): Promise<void> {
        const user = await this.getUser(id);
        if (!user)
            throw new NotFoundError();
        user.clearEmailCode("emailValidation");
    }

    async updateUserLocation(id: number, latitude: number, longitude: number): Promise<void> {
        const user = await this.getUser(id);
        if (!user)
            throw new NotFoundError();
        await this.userModel.update(id, {}, { latitude, longitude });
    }

    async updateUserProfile(id: number, profile: { bio?: string, tags?: string[], gender?: string, orientation?: string, bornAt?: Date }): Promise<void> {
        const user = await this.getUser(id);
        if (!user)
            throw new NotFoundError();
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
            throw new NotFoundError();
        if (!user.profilePictures || user.profilePictures.length <= pictureIndex)
            throw new NotFoundError();
        user.profilePictureIndex = pictureIndex;
        await this.userModel.update(id, { profilePictureIndex: pictureIndex });
        return (true);
    }

    async addUserProfilePicture(id: number, pictureName: string): Promise<void> {
        const user = await this.getUser(id);
        if (!user)
            throw new NotFoundError();
        user.profilePictures.push(pictureName);
        try {
            await this.userModel.update(user.id, {
                profilePictures: user.profilePictures
            });
        } catch (error) {
            fs.unlinkSync(pictureName);
            throw error;
        }

    }

    async removeUserProfilePicture(id: number, pictureIndex: number): Promise<void> {
        const user = await this.getUser(id);
        if (!user)
            throw new NotFoundError();
        const pictureToRemove = user.profilePicture && user.profilePictures[pictureIndex];
        if (!pictureToRemove)
            throw new NotFoundError();
        fs.unlinkSync(pictureToRemove);
        user.profilePictures = user.profilePictures.filter((_, index) => index !== pictureIndex);
        await this.userModel.update(user.id, {
           profilePictures: user.profilePictures
        });
    }
}

export default fp(async (fastify: FastifyInstance) => {
    const userService = new UserService(fastify);
    fastify.decorate('userService', userService);
});
