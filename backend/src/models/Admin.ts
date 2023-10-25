import {getModelForClass, prop} from "@typegoose/typegoose";

/**
 * @swagger
 * components:
 *   schemas:
 *     AdminRole:
 *       type: string
 *       enum:
 *         - GOD
 *         - STANDARD
 */
export enum AdminRole {
    GOD = "GOD",
    STANDARD= "STANDARD"
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Admin:
 *       required:
 *         - _id
 *         - adminRole
 *         - active
 *         - username
 *       properties:
 *         _id:
 *           $ref: '#/components/schemas/_id'
 *         adminRole:
 *           $ref: '#/components/schemas/AdminRole'
 *         active:
 *           type: boolean
 *         username:
 *           type: string
 *         passwordHash:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *         phoneNumber:
 *           type: string
 */
export class Admin {
    @prop({
        required: true,
        enum: AdminRole,
    })
    adminRole: AdminRole;

    @prop({
        required: true,
    })
    active: boolean;

    @prop({
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
    })
    username: string;

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

    @prop({
        unique: true,
        trim: true,
        lowercase: true,
        //from emailregex.com
        validate: new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
    })
    email?: string;

    @prop({
        trim: true,
        //from phoneregex.com
        validate: new RegExp(/^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/)
    })
    phoneNumber?: string;
}
export const adminModel = getModelForClass(Admin);