import 'fastify';
import ws from 'ws';

declare module 'fastify' {
  interface FastifyInstance {
    userService: {
      createUser(email: string, password: string, username: string, bornAt: Date, gender: string, orientation: string): Promise<string | undefined>;
      login(email: string, password: string): Promise<string | undefined>;
      verifyEmail(id: number): Promise<void>;
      updateUserLocation(id: number, latitude: number, longitude: number): Promise<void>;
      updateUserProfile(id: number, profile: { bio?: string, tags?: string[], gender?: string, orientation?: string, bornAt?: Date }): Promise<void>;
      updateUserProfilePicture(id: number, pictureIndex: number): Promise<string>;
      addUserProfilePicture(id: number, pictureName: string): Promise<void>;
      removeUserProfilePicture(id: number, pictureIndex: number): Promise<void>;
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
        location: { latitude: number | null; longitude: number | null };
        createdAt: Date;
      }>;
      getUserPublic(id: number): Promise<{
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
      addConnection(id: number, ws: WebSocket.WebSocket): void;
      removeConnection(id: number): void;
      closeConnection(id: number): void;
      sendMessage(id: number, data: DataTypes[types.MESSAGE]): void;
      sendLike(id: number, data: DataTypes[types.LIKE]): void;
      sendLikeBack(id: number, data: DataTypes[types.LIKE_BACK]): void;
      sendUnlike(id: number, data: DataTypes[types.UNLIKE]): void;
      sendProfileViewed(id: number, data: DataTypes[types.VIEWED]): void;
      findUserBySocket(ws: WebSocket.WebSocket): number | undefined;
    };
    authenticate(request: any, reply: any): Promise<void>;
  }

  type FastifyRequestUser = {
    id: number;
    email: string;
    username: string;
    isVerified: boolean;
  }

  interface FastifyRequest {
    user?: FastifyRequestUser | undefined;
  }
}
