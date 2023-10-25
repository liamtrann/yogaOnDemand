import {getModelForClass, modelOptions, prop, Ref} from "@typegoose/typegoose";
import {User} from "@/models/User";
import {Video} from "@/models/Video";

/**
 * @swagger
 * components:
 *   schemas:
 *     TransactionType:
 *       type: string
 *       enum:
 *         - VIDEO
 */
export enum TransactionType {
    VIDEO = "VIDEO",
}

/**
 * @swagger
 * components:
 *   schemas:
 *     WatchTransactionType:
 *       type: string
 *       enum:
 *         - START
 *         - PAUSE
 *         - CLOSE
 *         - SKIP
 *         - END
 */
export enum WatchTransactionType {
    START = "START",
    PAUSE = "PAUSE",
    CLOSE = "CLOSE",
    SKIP = "SKIP",
    END = "END"
}

/**
 * @swagger
 * components:
 *   schemas:
 *     WatchTransaction:
 *       required:
 *         - watchTransactionType
 *         - video
 *         - timestamp
 *         - videoLength
 *         - videoExperience
 *       properties:
 *         watchTransactionType:
 *           $ref: '#/components/schemas/WatchTransactionType'
 *         video:
 *           $ref: '#/components/schemas/Video'
 *         timestamp:
 *           type: number
 *         skipTo:
 *           type: number
 *         videoLength:
 *           type: number
 *         videoExperience:
 *           type: number
 */
@modelOptions({schemaOptions: {_id: false}})
export class WatchTransaction {
    @prop({
        required: true,
        enum: WatchTransactionType,
        index: true,
    })
    watchTransactionType: WatchTransactionType;

    @prop({
        required: true,
        ref: "Video"
    })
    video?: Ref<Video>;

    @prop()
    timestamp?: number;

    @prop()
    skipTo?: number;

    @prop()
    videoLength?: number;

    @prop()
    videoExperience?: number;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       required:
 *         - _id
 *         - transactionType
 *         - owner
 *         - creationDate
 *       properties:
 *         _id:
 *           $ref: '#/components/schemas/_id'
 *         transactionType:
 *           $ref: '#/components/schemas/TransactionType'
 *         owner:
 *           $ref: '#/components/schemas/User'
 *         watchTransaction:
 *           $ref: '#/components/schemas/WatchTransaction'
 *         creationDate:
 *           type: number
 */
export class Transaction {
    @prop({
        required: true,
        enum: TransactionType,
        index: true,
    })
    transactionType: TransactionType;

    @prop({
        required: true,
        index: true,
        ref: "User"
    })
    owner: Ref<User>;

    @prop({required: false})
    watchTransaction?: WatchTransaction;

    @prop({
        required: true,
        index: true
    })
    creationDate: number;
}
export const transactionModel = getModelForClass(Transaction);