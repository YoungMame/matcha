import bcrypt from 'bcrypt';

export default class PasswordManager {

    private static async generateSalt(): Promise<string> {
        const salt = await bcrypt.genSalt();
        return (salt);
    };

    static async hashPassword(password: string): Promise<string> {
        const salt = await PasswordManager.generateSalt();
        const hash = await bcrypt.hash(password, salt);

        return (hash);
    };

    static async compare(submit: string, password: string) {
        const result = await bcrypt.compare(submit, password);
        return (result);
    }
}