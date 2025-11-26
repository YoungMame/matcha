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
import { UnauthorizedError, NotFoundError, BadRequestError, InternalServerError, ForbiddenError, ConflictError } from "../utils/error";
import commonPasswords from '../utils/1000-most-common-passwords.json';
import { WebSocketMessageTypes, WebSocketMessageDataTypes } from "./WebSocketService";
import { Like } from "../models/Like";
import { getCityAndCountryFromCoords } from "../utils/geoloc";

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
        const codeLenght = 6;
        let codeArray: number[] = [];
        for (let i = 0; i < codeLenght; i++)
            codeArray[i] = Math.abs(Math.random() * (10 - 1)); // give a digit

        const code: string = codeArray.map(digit => Math.round(digit).toString()).join('');
        const seconds = 600;
        user.setEmailCode("emailValidation", seconds, code);
        this.fastify.mailService.sendEmailVerification(user.email, user.id, code);
    }

    async askForEmailVerification(userId: number): Promise<void> {
        const user = await this.getUser(userId);
        if (!user)
            throw new NotFoundError();

        this.sendVerificationEmail(user);
    }

    async verifyEmail(userId: number, code?: string): Promise<void> {
        const user = await this.getUser(userId);
        if (!user)
        {
            throw new NotFoundError();
        }
        if (code && user.getEmailCode("emailValidation") != code)
            throw new ForbiddenError();
        user.clearEmailCode("emailValidation");
        this.userModel.setVerified(userId);
    }

    public async getUser(idOrMail: string | number): Promise<User | null> {
        let userdata: undefined | User = undefined;
        if (typeof idOrMail == 'string')
            userdata = await this.userModel.findByEmail(idOrMail);
        else
            userdata = await this.userModel.findById(idOrMail);
        if (!userdata)
            return (null);
        let user: User = User.fromRow(userdata);
        return (user);
    }

    public async debugGetUser(idOrMail: string | number): Promise<User | null> {
        const user = await this.getUser(idOrMail);
        return (user);
    }

    public async debugGetUserEmailCode(userId: number, codeType: "emailValidation" | "dfaValidation" | "passwordResetValidation"): Promise<string | number | undefined> {
        const user = await this.getUser(userId);
        if (!user)
            throw new NotFoundError();
        return user.getEmailCode(codeType);
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

    async createUser(email: string, password: string, username: string, provider: string = 'local'): Promise<string | undefined> {
        if (!(email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)))
            throw new BadRequestError('Invalid email format');
        if (!(username.match(/^[a-zA-Z0-9._\- ]+$/)))
            throw new BadRequestError('Invalid username format');
        if (this.isPasswordCommon(password))
            throw new BadRequestError('Password is too common');
        const hashedPassword = await PasswordManager.hashPassword(password);
        const userId = await this.userModel.insert(email, hashedPassword, username, provider);
        const user = await this.getUser(userId);
        if (!user)
            throw new InternalServerError('User not found');
        const jwt = await this.fastify.jwt.sign({ id: userId, email: email, username: username, isVerified: false, isCompleted: false });
        this.sendVerificationEmail(user);
        return (jwt);
    }

    async login(email: string, password: string) {
        const user = await this.getUser(email);
        if (!user || user.provider !== 'local')
            throw new UnauthorizedError();
        const isValid = await PasswordManager.compare(password, user.passwordHash);
        if (!isValid)
            throw new UnauthorizedError();
        const jwt = await this.fastify.jwt.sign({ id: user.id, email: user.email, username: user.username, isVerified: user.isVerified, isCompleted: user.isProfileCompleted });
        return (jwt);
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
        isProfileCompleted: boolean;
        fameRate: number | undefined;
        location: { latitude: number | undefined; longitude: number | undefined, city: string | undefined; country: string | undefined };
        createdAt: Date;
    }> {
        const user = await this.getUser(id);
        if (!user || !user.isProfileCompleted)
            throw new NotFoundError();
        return {
            id: user.id,
            email: user.email,
            username: user.username,
            profilePictureIndex: user.profilePictureIndex,
            profilePictures: user.profilePictures || [],
            bio: user.bio || '',
            tags: user.tags || [],
            bornAt: user.bornAt as Date,
            orientation: user.orientation as string,
            gender: user.gender as string,
            isVerified: user.isVerified,
            isProfileCompleted: user.isProfileCompleted,
            fameRate: user.fameRate,
            location: {
                latitude: user.location?.latitude,
                longitude: user.location?.longitude,
                city: user.location?.city,
                country: user.location?.country
            },
            createdAt: user.createdAt
        };
    }

    async updateUserLocation(id: number, latitude: number, longitude: number): Promise<void> {
        const user = await this.getUser(id);
        if (!user)
            throw new NotFoundError();
        const { city, country } = await getCityAndCountryFromCoords(latitude, longitude);
        return await this.userModel.update(id, {}, { latitude, longitude, city, country });
    }

    async completeProfile(id: number, profile: { firstName: string, lastName: string, bio: string, tags: string[], gender: string, orientation: string, bornAt: Date }): Promise<string> {
        const user = await this.getUser(id);
        if (!user)
            throw new NotFoundError();
        if (user.isProfileCompleted)
            throw new BadRequestError('Profile already completed');
        if (user.isVerified === false)
            throw new BadRequestError('Email not verified');
        await this.userModel.update(id, {
            ...profile,
            isProfileCompleted: true
        });
        const jwt = await this.fastify.jwt.sign({ id: user.id, email: user.email, username: user.username, isVerified: user.isVerified, isCompleted: true });
        return jwt;
    }

    async updateUserProfile(id: number, profile: { bio?: string, tags?: string[], gender?: string, orientation?: string, bornAt?: Date }): Promise<void> {
        const user = await this.getUser(id);
        if (!user)
            throw new NotFoundError();
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
           profilePictureIndex: user.profilePictureIndex
        });
    }

    async getUserPublic(viewerId: number | undefined, id: number | string): Promise<{
        id: number;
        username: string;
        firstName: string;
        lastName: string;
        profilePictureIndex: number | undefined;
        profilePictures: string[] | undefined;
        bio: string;
        tags: string[];
        bornAt: Date;
        gender: string;
        orientation: string;
        fameRate: number | undefined;
        location: { latitude: number | undefined; longitude: number | undefined, city: string | undefined; country: string | undefined };
        isConnectedWithMe: boolean;
        chatIdWithMe: number | undefined;
        haveILiked: boolean;
        hasLikedMe: boolean;
    }> {
        const user = await this.getUser(id);
        if (!user|| !user.isProfileCompleted)
            throw new NotFoundError();
        if (viewerId)
        {
            const isBlocking = await this.isUserBlockedBy(viewerId, user.id);
            if (isBlocking)
                throw new NotFoundError();
            const isBlocked = await this.isUserBlockedBy(user.id, viewerId);
            if (isBlocked)
                throw new NotFoundError();
            const existingView = await this.viewModel.getBeetweenUsers(viewerId, user.id);
            if (!existingView)
            {
                const view = await this.viewModel.insert(viewerId, user.id);
                await this.updateFameRate(user.id);
                this.fastify.webSocketService.sendProfileViewed(user.id, {
                    id: view.id,
                    viewerId: view.viewerId,
                    createdAt: view.createdAt
                });
                await this.fastify.notificationService.createNotification(user.id, view.viewerId, 'view', view.id);
            }
        }
        const chatWithMe = viewerId ?  (await this.fastify.chatService.getChatBetweenUsers([viewerId || -1, user.id])) : null;
        const chatIdWithMe = chatWithMe ? chatWithMe.id : undefined;
        const isConnectedWithMe = chatIdWithMe ? true : false;
        const hasLikedMe = viewerId ? (await this.likeModel.getLikeBetweenUsers(user.id, viewerId) ? true : false) : false;
        const haveILiked = viewerId ? (await this.likeModel.getLikeBetweenUsers(viewerId, user.id) ? true : false) : false;
        return {
            id: user.id,
            username: user.username,
            firstName: user.firstName as string,
            lastName: user.lastName as string,
            profilePictureIndex: user.profilePictureIndex,
            profilePictures: user.profilePictures || [],
            bio: user.bio || '',
            tags: user.tags || [],
            bornAt: user.bornAt as Date,
            gender: user.gender as string ,
            orientation: user.orientation as string,
            fameRate: user.fameRate,
            location: {
                latitude: user.location?.latitude,
                longitude: user.location?.longitude,
                city: user.location?.city,
                country: user.location?.country
            },
            isConnectedWithMe,
            chatIdWithMe,
            haveILiked,
            hasLikedMe
        };
    }

    private async isUserLikeable(senderId: number, receiverId: number): Promise<void> {
        if (senderId === receiverId)
            throw new BadRequestError();
        const isBlocking = await this.isUserBlockedBy(senderId, receiverId);
        if (isBlocking)
            throw new NotFoundError();
        const isBlocked = await this.isUserBlockedBy(receiverId, senderId);
        if (isBlocked)
            throw new NotFoundError();
        const receiverUser = await this.getUser(receiverId);
        if (!receiverUser || !receiverUser.isProfileCompleted)
            throw new NotFoundError();
        const existingProfilePicture = receiverUser.profilePictures?.[receiverUser.profilePictureIndex || 0];
        if (!existingProfilePicture)
            throw new BadRequestError('User has no profile picture');
    }

    private async updateFameRate(userId: number): Promise<number> {
        const likesReceived = await this.likeModel.getAllByLikedId(userId);
        const viewsReceived = await this.viewModel.getAllByViewedId(userId);

        const fameRate = (likesReceived.length && viewsReceived.length) ? Number((likesReceived.length / viewsReceived.length).toPrecision(2)) * 1000 : 0;
        await this.userModel.update(userId, { fameRate });
        return fameRate;
    }

    async sendLike(senderId: number, receiverId: number): Promise<void> {
        await this.isUserLikeable(senderId, receiverId);
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
            await this.fastify.notificationService.createNotification(receiverId, senderId, 'like_back', chatId);

        }
        const data: WebSocketMessageDataTypes[WebSocketMessageTypes.LIKE] = {
            id: like.id,
            likerId: senderId,
            createdAt: like.createdAt
        };
        await this.updateFameRate(receiverId);
        this.fastify.webSocketService.sendLike(receiverId, data);
        await this.fastify.notificationService.createNotification(receiverId, senderId, 'like', like.id);
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
        await this.updateFameRate(receiverId);
        this.fastify.webSocketService.sendUnlike(receiverId, data);
        await this.fastify.notificationService.createNotification(receiverId, senderId, 'unlike', like.id);
    }

    async getLikes(userId: number): Promise<Like[]> {
        const likes = await this.likeModel.getAllByLikedId(userId);
        return likes;
    }

    async setUserDisconnected(userId: number): Promise<void> {
        await this.userModel.setUserConnection(userId, false, new Date());
    }

    async setUserConnected(userId: number): Promise<void> {
        await this.userModel.setUserConnection(userId, true);
    }

    async getUserConnectionStatus(userId: number, targetId: number): Promise<{ isConnected: boolean; lastConnection: Date | undefined } | null> {
        const connection = await this.userModel.getUserConnection(userId);
        const isBlocking = await this.isUserBlockedBy(userId, targetId);
        if (isBlocking)
            return null;
        const isBlocked = await this.isUserBlockedBy(targetId, userId);
        if (isBlocked)
            return null;
        return connection;
    }

    async isUserBlockedBy(blockedId: number, blockerId: number): Promise<boolean> {
        const result = await this.userModel.getBlockedUser(blockedId, blockerId);
        if (result)
            return true;
        return false;
    }

    async blockUser(userId: number, targetId: number): Promise<void> {
        const isRecBlocked = await this.isUserBlockedBy(userId, targetId);
        if (isRecBlocked)
            throw new BadRequestError();
        const isAlreadyBlocked = await this.isUserBlockedBy(targetId, userId);
        if (isAlreadyBlocked)
            throw new ConflictError();
        const result = await this.userModel.insertBlockedUser(userId, targetId);
        if (!result)
            throw new InternalServerError();
        return ;
    }

    async unblockUser(userId: number, targetId: number): Promise<void> {
        const isAlreadyBlocked = await this.isUserBlockedBy(targetId, userId);
        if (!isAlreadyBlocked)
            throw new ConflictError();

        await this.userModel.removeBlockedUser(userId, targetId);
        return ;
    }

    async getBlockedUsersDetails(userId: number): Promise<{ id: number; username: string; createdAt: Date }[]> {
        return await this.userModel.getBlockedUsersByBlockerIdDetails(userId);
    }


    async getBlockedUsers(userId: number): Promise<Map<number, Date>> {
        return await this.userModel.getBlockedUsersByBlockerId(userId);
    }

    async getBlockerUsers(userId: number): Promise<Map<number, Date>> {
        const blockerUsers = await this.userModel.getBlockerUsersByBlockedId(userId);
        return blockerUsers;
    }
}

export default fp(async (fastify: FastifyInstance) => {
    const userService = new UserService(fastify);
    fastify.decorate('userService', userService);
});
