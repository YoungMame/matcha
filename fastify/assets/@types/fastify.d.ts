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
    };
    authenticate(request: any, reply: any): Promise<void>;
  }

  type FastifyRequestUser = {
    id: number;
    email: string;
    username: string;
  }

  interface FastifyRequest {
    user?: FastifyRequestUser | undefined;
  }
}
