import fastify from '../app';
import PasswordManager from "../utils/password";
import User from "../classes/User";
import { insert, findByEmail, findById } from "../models/User";
import fp from 'fastify-plugin';

class UserService {
    private async sendVerificationEmail(email: string, userId: number): Promise<void> {
        // Implementation for sending verification email
        const codeLenght = 6;
        let codeArray: number[] = [];
        for (let i = 0; i < codeLenght; i++)
            codeArray[i] = Math.random() * 10 - 1; // give a digit
            
        const code = codeArray.map(digit => digit.toString()).join('');
        console.log(`Sending verification email to ${email} for user ID ${userId} with code ${code}`);

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

    async createUser(email: string, password: string, username: string, born_at: Date, gender: string, orientation: string): Promise<User | null> {
        if (!(email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)))
            return (null);
        if (!(username.match(/^[a-zA-Z0-9._\- ]+$/)))
            return (null);
        const hashedPassword = await PasswordManager.hashPassword(password);
        const row = await insert(email, hashedPassword, username, born_at, gender, orientation);
        const userId = row.id;
        const user = this.getUser(userId);
        this.sendVerificationEmail(email, userId);
        return (user);
    }
}

export default fp(async (fastify) => {
    fastify.decorate('userService', UserService);
});
