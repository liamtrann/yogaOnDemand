import {genSalt, hash, compare} from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
    const salt = await genSalt(10);
    return await hash(password, salt);
}

export function comparePasswordToHash(password: string, hash: string): Promise<boolean> {
    return compare(password, hash);
}