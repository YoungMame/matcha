import PasswordManager from "../utils/password";
import User from "../classes/User";
import UserModel from "../models/User";
import LikeModel from "../models/Like";
import ViewModel from "../models/View"
// import ChatModel from "../models/Chat";
import fp from 'fastify-plugin';
import fs from 'fs';
import path from "path";
import { FastifyInstance } from 'fastify';
import { UnauthorizedError, NotFoundError, BadRequestError, InternalServerError, ForbiddenError } from "../utils/error";
import commonPasswords from '../utils/1000-most-common-passwords.json';
import { WebSocketMessageTypes, WebSocketMessageDataTypes } from "./WebSocketService";
import { Like } from "../models/Like"

class UserService {
    private fastify: FastifyInstance;
    private userModel: UserModel;
    private likeModel: LikeModel;
    private viewModel: ViewModel
    // private chatModel: ChatModel;
    UsersCache: Map<number, User>;

    constructor(fastify: FastifyInstance) {
        this.fastify = fastify;
        this.userModel = new UserModel(fastify);
        this.likeModel = new LikeModel(fastify);
        this.viewModel = new ViewModel(fastify);
        // this.chatModel = new ChatModel(fastify);
        this.UsersCache = new Map<number, User>();
    }

    private async sendVerificationEmail(user: User): Promise<void> {
        // Implementation for sending verification email
        const codeLenght = 6;
        let codeArray: number[] = [];
        for (let i = 0; i < codeLenght; i++)
            codeArray[i] = Math.random() * 10 - 1; // give a digit

        const code = codeArray.map(digit => Math.round(digit).toString()).join('');
        const seconds = 600;
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

    private isPasswordCommon(password: string): boolean {
        if (commonPasswords.includes(password))
            return true;

        const normalizedPassword = password.trim().toLowerCase().replace(/[^a-z]/g, '');
        if (commonPasswords.includes(normalizedPassword))
            return true;

        const normalizedPasswordWithNumbers = password.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        if (commonPasswords.includes(normalizedPasswordWithNumbers))
            return true;

        const normalizedPasswordWithNumbersAndUpper = password.trim().replace(/[^a-z0-9A-Z]/g, '');
        if (commonPasswords.includes(normalizedPasswordWithNumbersAndUpper))
            return true;

        const normalizedPasswordWithUpper = password.trim().replace(/[^a-zA-Z]/g, '');
        if (commonPasswords.includes(normalizedPasswordWithUpper))
            return true;

        return false;
    }

    async createUser(email: string, password: string, username: string, bornAt: Date, gender: string, orientation: string): Promise<string | undefined> {
        if (!(email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)))
            throw new BadRequestError('Invalid email format');
        if (!(username.match(/^[a-zA-Z0-9._\- ]+$/)))
            throw new BadRequestError('Invalid username format');
        if (this.isPasswordCommon(password))
            throw new BadRequestError('Password is too common');
        const hashedPassword = await PasswordManager.hashPassword(password);
        const userId = await this.userModel.insert(email, hashedPassword, username, bornAt, gender, orientation);
        const user = await this.getUser(userId);
        if (!user)
            throw new InternalServerError('User not found');
        const jwt = await this.fastify.jwt.sign({ id: userId, email: email, username: username, isVerified: false});
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
        const jwt = await this.fastify.jwt.sign({ id: user.id, email: user.email, username: user.username, isVerified: user.isVerified });
        return (jwt);
    }

    async verifyEmail(id: number): Promise<void> {
        const user = await this.getUser(id);
        if (!user)
            throw new NotFoundError();
        user.clearEmailCode("emailValidation");
    }

    async getMe(id: number): Promise<{
        id: number;
        email: string;
        username: string;
        profilePictureIndex: number | undefined;
        profilePictures: string[];
        bio: string;
        tags: string[];
        bornAt: Date;
        orientation: string;
        gender: string;
        isVerified: boolean;
        location: { latitude: number | null; longitude: number | null };
        createdAt: Date;
    }> {
        const user = await this.getUser(id);
        if (!user)
            throw new NotFoundError();
        return {
            id: user.id,
            email: user.email,
            username: user.username,
            profilePictureIndex: user.profilePictureIndex,
            profilePictures: user.profilePictures || [],
            bio: user.bio || '',
            tags: user.tags || [],
            bornAt: user.bornAt,
            orientation: user.orientation,
            gender: user.gender,
            isVerified: user.isVerified,
            location: {
                latitude: user.location?.latitude || null,
                longitude: user.location?.longitude || null
            },
            createdAt: user.createdAt
        };
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

    async updateUserProfilePicture(id: number, pictureIndex: number): Promise<string> {
        const user = await this.getUser(id);
        if (!user)
            throw new NotFoundError();
        if (!user.profilePictures || !user.profilePictures[pictureIndex])
            throw new NotFoundError();
        user.profilePictureIndex = pictureIndex;
        await this.userModel.update(id, { profilePictureIndex: pictureIndex });
        return user.profilePictures[pictureIndex];
    }

    async addUserProfilePicture(id: number, pictureName: string): Promise<void> {
        const user = await this.getUser(id);
        if (!user)
            throw new NotFoundError();
        if (user.profilePictureIndex === undefined)
            user.profilePictureIndex = 0;
        user.profilePicture ? user.profilePictures.push(pictureName) : user.profilePictures = [pictureName];
        try {
            await this.userModel.update(user.id, {
                profilePictures: user.profilePictures,
                profilePictureIndex: user.profilePictureIndex
            });
        } catch (error) {
            user.profilePictures.pop();
            user.profilePictureIndex = (user.profilePictures.length === 0) ? undefined : 0;
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
        const pictureUploadName = pictureToRemove.split('/uploads/')[1];
        if (!pictureUploadName)
            throw new NotFoundError();
        const picturePath = path.join(__dirname, '..', '..', 'uploads', pictureUploadName);
        fs.unlinkSync(picturePath);
        user.profilePictures = user.profilePictures.filter((_, index) => index !== pictureIndex);
        if (user.profilePictureIndex !== undefined) {
            if (pictureIndex < user.profilePictureIndex) {
                user.profilePictureIndex -= 1;
            } else if (pictureIndex === user.profilePictureIndex) {
                user.profilePictureIndex = user.profilePictures.length > 0 ? 0 : undefined;
            }
        }
        await this.userModel.update(user.id, {
           profilePictures: user.profilePictures,
           profilePictureIndex: (user.profilePictureIndex == undefined ? null : user.profilePictureIndex)
        });
    }

    async getUserPublic(viewerId: number | undefined, id: number | string): Promise<{
        id: number;
        username: string;
        profilePictureIndex: number | undefined;
        profilePictures: string[] | undefined;
        bio: string;
        tags: string[];
        bornAt: Date;
        gender: string;
        orientation: string;
        location: { latitude: number | null; longitude: number | null };
    }> {
        const user = await this.getUser(id);
        if (!user)
            throw new NotFoundError();
        if (viewerId)
        {
            const existingView = await this.viewModel.getBeetweenUsers(viewerId, user.id);
            if (!existingView)
            {
                const view = await this.viewModel.insert(viewerId, user.id);
                this.fastify.webSocketService.sendProfileViewed(user.id, {
                    id: view.id,
                    viewerId: view.viewerId,
                    createdAt: view.createdAt
                });
            }
        }
        return {
            id: user.id,
            username: user.username,
            profilePictureIndex: user.profilePictureIndex,
            profilePictures: user.profilePictures || [],
            bio: user.bio || '',
            tags: user.tags || [],
            bornAt: user.bornAt,
            gender: user.gender,
            orientation: user.orientation,
            location: {
                latitude: user.location?.latitude || null,
                longitude: user.location?.longitude || null
            }
        };
    }

    async sendLike(senderId: number, receiverId: number): Promise<void> {
        if (senderId === receiverId)
            throw new BadRequestError();
        // TODO check if user as a pp and is verified before he can be liked
        const existingLike = await this.likeModel.getLikeBetweenUsers(senderId, receiverId);
        if (existingLike)
            throw new ForbiddenError();
        const existingLikeBack = await this.likeModel.getLikeBetweenUsers(receiverId, senderId);
        const like = await this.likeModel.insert(senderId, receiverId)
        if (existingLikeBack)
        {
            const chatId = await this.fastify.chatService.createChat([senderId, receiverId]);
            const data: WebSocketMessageDataTypes[WebSocketMessageTypes.LIKE_BACK] = {
                id: like.id,
                createdChatId: chatId,
                createdAt: like.createdAt
            };
            this.fastify.webSocketService.sendLikeBack(receiverId, data);
        }
        const data: WebSocketMessageDataTypes[WebSocketMessageTypes.LIKE] = {
            id: like.id,
            likerId: senderId,
            createdAt: like.createdAt
        };
        this.fastify.webSocketService.sendLike(receiverId, data);
    }

    async sendUnlike(senderId: number, receiverId: number): Promise<void> {
        if (senderId === receiverId)
            throw new BadRequestError();
        const like = await this.likeModel.getLikeBetweenUsers(senderId, receiverId);
        if (!like)
            throw new NotFoundError();
        const likeId = like.id;
        await this.likeModel.remove(likeId);
        const chat = await this.fastify.chatService.getChatBetweenUsers([senderId, receiverId]);
        let chatId: number;
        if (chat) {
            chatId = chat.id;
            await this.fastify.chatService.deleteChat(chatId);
        }  else {
            chatId = -1;
        }
        const data: WebSocketMessageDataTypes[WebSocketMessageTypes.UNLIKE] = {
            id: likeId,
            unlikerId: senderId,
            createdChatId: chatId,
            removedAt: new Date()
        };
        this.fastify.webSocketService.sendUnlike(receiverId, data);
    }

    async getLikes(userId: number): Promise<Like[]> {
        const like = await this.likeModel.getAllByLikedId(userId);
        return like;
    }

    async setUserDisconnected(userId: number): Promise<void> {
        await this.userModel.setUserConnection(userId, false, new Date());
    }

    async setUserConnected(userId: number): Promise<void> {
        await this.userModel.setUserConnection(userId, true);
    }

}

export default fp(async (fastify: FastifyInstance) => {
    const userService = new UserService(fastify);
    fastify.decorate('userService', userService);
});
