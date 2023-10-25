import {getModelForClass, prop, Ref} from "@typegoose/typegoose";
import {Admin} from "@/models/Admin";
import {User} from "@/models/User";

/**
 * @swagger
 * components:
 *   schemas:
 *     UserNote:
 *       description: Used by admins to make notes about users
 *       required:
 *         - _id
 *         - creator
 *         - user
 *         - text
 *         - creationDate
 *         - lastTouched
 *       properties:
 *         _id:
 *           $ref: '#/components/schemas/_id'
 *         creator:
 *           $ref: '#/components/schemas/Admin'
 *         user:
 *           $ref: '#/components/schemas/User'
 *         text:
 *           type: string
 *         creationDate:
 *           type: number
 *         lastTouched:
 *           type: number
 */
export class UserNote {
    @prop({
        required: true,
        ref: Admin,
    })
    creator: Ref<Admin>;

    @prop({
        required: true,
        ref: User,
    })
    user: Ref<User>;

    @prop({required: true})
    text: string;

    @prop({required: true})
    creationDate: number;

    @prop({required: true})
    lastTouched: number;
}
export const userNoteModel = getModelForClass(UserNote);

