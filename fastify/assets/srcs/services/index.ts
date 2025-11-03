import { FastifyInstance } from "fastify";
import UserServicePlugin from '../services/UserService';

const appServices = async (fastify: FastifyInstance) => {
    fastify.register(UserServicePlugin);
    // Register other services similarly
}

export default appServices;