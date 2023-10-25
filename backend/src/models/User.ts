import {getModelForClass, prop, Ref} from "@typegoose/typegoose";
import {Class} from "@/models/Class";

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       required:
 *         - _id
 *         - active
 *         - email
 *       properties:
 *         _id:
 *           $ref: '#/components/schemas/_id'
 *         active:
 *           type: boolean
 *         stripeID:
 *           type: string
 *         email:
 *           type: string
 *         passwordHash:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         freeSubscriptionExpiration:
 *           type: number
 *         favoriteClasses:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Class'
 */
export class User {
    @prop({
        required: true,
    })
    active: boolean;

    @prop({
        trim: true,
        lowercase: true,
        unique: true,
        //from emailregex.com
        validate: new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
    })
    email?: string;

    @prop({
        required: true,
        select: false,
    })
    passwordHash?: string;

    @prop({
        trim: true,
        minlength: 1,
    })
    firstName?: string;

    @prop({
        trim: true,
        minlength: 1,
    })
    lastName?: string;

    @prop()
    iosReceiptData?: string;

    @prop({
        select: false
    })
    freeSubscriptionExpiration?: number;

    @prop({
        required: true,
        select: false,
        ref: Class
    })
    favoriteClasses?: Ref<Class>[];
}
export const userModel = getModelForClass(User);