import {getModelForClass, modelOptions, prop, Ref} from "@typegoose/typegoose";
import {Instructor} from "@/models/Instructor";
import {Class} from "@/models/Class";
import {VideoSource} from "@/models/VideoSource";
import {Category} from "@/models/Category";
import {Asset} from "@/models/Asset";

/**
 * @swagger
 * components:
 *   schemas:
 *     Equipment:
 *       type: string
 *       enum:
 *         - WORKOUT_MAT
 *         - LIGHT_WEIGHTS
 *         - MEDIUM_WEIGHTS
 *         - HEAVY_WEIGHTS
 *         - BIKE
 *         - RESISTANT_BAND
 *         - PILATES_FIT_BALL
 *         - AERIAL_YOGA_HAMMOCK
 */
export enum Equipment {
    WORKOUT_MAT = "WORKOUT_MAT",
    LIGHT_WEIGHTS = "LIGHT_WEIGHTS",
    MEDIUM_WEIGHTS = "MEDIUM_WEIGHTS",
    HEAVY_WEIGHTS = "HEAVY_WEIGHTS",
    BIKE = "BIKE",
    RESISTANT_BAND = "RESISTANT_BAND",
    PILATES_FIT_BALL = "PILATES_FIT_BALL",
    AERIAL_YOGA_HAMMOCK = "AERIAL_YOGA_HAMMOCK"
}

/**
 * @swagger
 * components:
 *   schemas:
 *     VideoIntervalIcon:
 *       type: string
 *       enum:
 *         - HEART
 *         - STRETCH
 *         - MEDITATION
 *         - WEIGHTS
 *         - ENDURANCE
 *         - HIIT
 */
export enum VideoIntervalIcon {
    HEART = "HEART",
    STRETCH = "STRETCH",
    MEDITATION = "MEDITATION",
    WEIGHTS = "WEIGHTS",
    ENDURANCE = "ENDURANCE",
    HIIT = "HIIT"
}

/**
 * @swagger
 * components:
 *   schemas:
 *     VideoInterval:
 *       required:
 *         - icon
 *         - name
 *         - duration
 *       properties:
 *         icon:
 *           $ref: '#/components/schemas/VideoIntervalIcon'
 *         name:
 *           type: string
 *         duration:
 *           type: number
 */
@modelOptions({schemaOptions: {_id: false}})
export class VideoInterval {
    @prop({
        required: true,
        enum: VideoIntervalIcon
    })
    icon: VideoIntervalIcon;

    @prop({required: true})
    name: string;

    @prop({required: true})
    duration: number;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Video:
 *       required:
 *         - _id
 *         - disabled
 *         - isTopPick
 *         - class
 *         - videoSource
 *         - categories
 *         - equipment
 *         - intervals
 *         - creationDate
 *         - dateLastUpdated
 *         - dateLastViewed
 *       properties:
 *         _id:
 *           $ref: '#/components/schemas/_id'
 *         disabled:
 *           type: boolean
 *         hidden:
 *           type: boolean
 *         isTopPick:
 *           type: boolean
 *         class:
 *           $ref: '#/components/schemas/_id'
 *         classNumber:
 *           type: number
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         instructor:
 *           $ref: '#/components/schemas/Instructor'
 *         videoSource:
 *           $ref: '#/components/schemas/_id'
 *         level:
 *           type: number
 *         experience:
 *           type: number
 *         categories:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/_id'
 *         equipment:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Equipment'
 *         intervals:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/VideoInterval'
 *         creationDate:
 *           type: number
 *         dateLastUpdated:
 *           type: number
 *         dateLastViewed:
 *           type: number
 *         image:
 *           $ref: '#/components/schemas/Asset'
 */
export class Video {
    @prop({
        required: true
    })
    disabled: boolean;

    @prop()
    hidden: boolean;

    @prop({
        required: true
    })
    isTopPick: boolean;

    @prop({
        required: true,
        ref: "Class",
    })
    class: Ref<Class>;

    @prop()
    classNumber: number;

    @prop({trim: true})
    name: string;

    @prop({required: true})
    description: string;

    @prop({ref: Instructor})
    instructor: Ref<Instructor>;

    @prop({
        required: true,
        ref: "VideoSource"
    })
    videoSource: Ref<VideoSource>;

    @prop()
    level: number;

    @prop()
    experience: number;

    @prop({
        required: true,
        ref: Category
    })
    categories: Ref<Category>[];

    @prop({
        required: true,
        type: String
    })
    equipment: Equipment[];

    @prop({
        required: true,
        type: VideoInterval
    })
    intervals: VideoInterval[];

    @prop({required: true})
    creationDate: number;

    @prop({required: true})
    dateLastUpdated: number;

    @prop()
    dateLastViewed: number;

    @prop({
        required: true,
        ref: "Asset"
    })
    image: Ref<Asset>;
}

export const videoModel = getModelForClass(Video);
