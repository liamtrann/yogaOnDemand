import {getModelForClass, prop, Ref} from "@typegoose/typegoose";
import {User} from "@/models/User";
import {Admin} from "@/models/Admin";

/**
 * @swagger
 * components:
 *   schemas:
 *     TokenType:
 *       type: string
 *       enum:
 *         - Admin
 *         - User
 *         - User_With_Subscription
 */
export enum TokenType {
    Admin = "Admin",
    User = "User",
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Token:
 *       description: Used to check logged in status for authenticated api calls
 *       required:
 *         - _id
 *         - tokenType
 *         - owner
 *         - token
 *         - timesExtended
 *         - lastTouched
 *       properties:
 *         _id:
 *           $ref: '#/components/schemas/_id'
 *         tokenType:
 *           $ref: '#/components/schemas/TokenType'
 *         owner:
 *           type: string
 *         token:
 *           type: string
 *         timesExtended:
 *           type: number
 *         lastTouched:
 *           type: number
 */
export class Token {
    @prop({
        required: true,
        enum: TokenType,
    })
    tokenType?: TokenType;

    @prop({
        required: true,
        refPath: 'tokenType',
    })
    owner?: Ref<User | Admin>;

    @prop({
        required: true,
        unique: true,
        index: true,
        minlength: 64
    })
    token: string;

    @prop({
        required: true,
    })
    timesExtended?: number;

    @prop({
        required: true,
    })
    lastTouched?: number;
}
export const tokenModel = getModelForClass(Token);
