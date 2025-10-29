import 'fastify';

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
