import {getModelForClass, prop, Ref} from "@typegoose/typegoose";
import {User} from "@/models/User";

/**
 * @swagger
 * components:
 *   schemas:
 *     ForgotPassword:
 *       required:
 *         - _id
 *         - user
 *         - verificationCodeHash
 *         - creationDate
 *       properties:
 *         _id:
 *           $ref: '#/components/schemas/_id'
 *         user:
 *           $ref: '#/components/schemas/User'
 *         verificationCodeHash:
 *           type: string
 *         creationDate:
 *           type: number
 */
export class ForgotPassword {
    @prop({
        required: true,
        ref: User,
    })
    user: Ref<User>;

    @prop({
        required: true,
        select: false,
    })
    verificationCodeHash: string;

    @prop({
        required: true,
    })
    creationDate: number;
}
export const forgotPasswordModel = getModelForClass(ForgotPassword);