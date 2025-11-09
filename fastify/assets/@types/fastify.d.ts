import 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    userService: {
      debugGetUser(idOrMail: string | number): Promise<User | null>;
      debugGetUserEmailCode(userId: number, codeType: "emailValidation" | "dfaValidation" | "passwordResetValidation"): Promise<string | number | undefined>;

      createUser(email: string, password: string, username: string): Promise<string | undefined>;
      login(email: string, password: string): Promise<string | undefined>;
      askForEmailVerification(userId: number): Promise<void>
      verifyEmail(id: number, code?: string): Promise<void>;
      completeProfile(id: number, profile: { firstName: string, lastName: string, bio: string, tags: string[], gender: string, orientation: string, bornAt: Date }): Promise<string>;
      updateUserLocation(id: number, latitude: number, longitude: number): Promise<void>;
      updateUserProfile(id: number, profile: { bio?: string, tags?: string[], gender?: string, orientation?: string, bornAt?: Date }): Promise<void>;
      updateUserProfilePicture(id: number, pictureIndex: number): Promise<string>;
      addUserProfilePicture(id: number, pictureName: string): Promise<void>;
      removeUserProfilePicture(id: number, pictureIndex: number): Promise<void>;
      sendLike(senderId: number, receiverId: number): Promise<void>;
      sendUnlike(senderId: number, receiverId: number): Promise<void>;
      getLikes(userId: number): Promise<Like[]>;
      setUserConnected(userId: number): Promise<void>;
      setUserDisconnected(userId: number): Promise<void>;
      getUserConnectionStatus(userId: number): Promise<{ isConnected: boolean; lastConnection: Date | undefined } | null>;
      getMe(id: number): Promise<{
        id: number;
        email: string;
        username: string;
        profilePictureIndex: number | undefined;
        profilePictures: string[];
        bio: string;
        tags: string[];
        bornAt: Date;
        gender: string;
        orientation: string;
        isVerified: boolean;
        isProfileCompleted: boolean;
        location: { latitude: number | null; longitude: number | null };
        createdAt: Date;
      }>;
      getUserPublic(viewerId: number | undefined, id: number | string): Promise<{
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
      }>;
    };
    webSocketService: {
      handleClientMessage(id: number, message: string): void;
      addConnection(id: number, ws): void;
      removeConnection(id: number): void;
      closeConnection(id: number): void;
      sendMessage(id: number, data: DataTypes[types.MESSAGE]): void;
      sendLike(id: number, data: DataTypes[types.LIKE]): void;
      sendLikeBack(id: number, data: DataTypes[types.LIKE_BACK]): void;
      sendUnlike(id: number, data: DataTypes[types.UNLIKE]): void;
      sendProfileViewed(id: number, data: DataTypes[types.VIEWED]): void;
      sendChatEvent(id: id, data: WebSocketMessageDataTypes[WebSocketMessageTypes.CHATEVENT]): void;
      findUserBySocket(ws): number | undefined;
    };

    chatService: {
      createChat(userIds: number[]): Promise<number>;
      deleteChat(id: number): Promise<void>;
      getChat(userId: number | undefined ,id: number): Promise<Chat | null>;
      sendMessage(senderId: number, chatId: number, content: string): Promise<void>;
      addChatFile(senderId: number, fileURL: string, chatId: number): Promise<void>;
      getChatBetweenUsers(userId1s: number[]): Promise<Chat | null>;
      getChatMessages(userId: number, chatId: number, fromLast: number, toLast: number): Promise<ChatMessage[]>;
      deleteChatEvent(userId: number, chatId: number): Promise<void>;
      createChatEvent(userId: number, chatId: number, title: string, latitude: number, longitude: number, date: Date): Promise<ChatEvent>;
    };

    mailService: {
      send2faCode(to: string, code: string): Promise<void>;
      sendEmailVerification(to: string, userId: number, code: string): Promise<void>;
      sendPasswordResetCode(to: string, code: string): Promise<void>;
    };

    nodemailer: any;

    authenticate(request: any, reply: any): Promise<void>;
    checkImageConformity(request: any, reply: any): Promise<void>;
    checkIsCompleted(request: any, reply: any): Promise<void>;
    checkIsVerified(request: any, reply: any): Promise<void>;
  }

  type FastifyRequestUser = {
    id: number;
    email: string;
    username: string;
    isVerified: boolean;
    isProfileCompleted: boolean;
  }

  interface FastifyRequest {
    user?: FastifyRequestUser | undefined;
    fileBuffer?: Buffer<ArrayBufferLike>;
    fileMeta?: {
      filename: string;
      mimetype: string;
      fields: fastifyMultipart.MultipartFields;
    };
  }
}
