import {getModelForClass, prop, Ref} from "@typegoose/typegoose";
import {Category} from "@/models/Category";
import {Asset} from "@/models/Asset";

/**
 * @swagger
 * components:
 *   schemas:
 *     Class:
 *       required:
 *         - _id
 *         - disabled
 *         - name
 *         - categories
 *         - image
 *         - creationDate
 *         - dateLastUpdated
 *       properties:
 *         _id:
 *           $ref: '#/components/schemas/_id'
 *         disabled:
 *           type: boolean
 *         name:
 *           type: string
 *         categories:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Category'
 *         image:
 *           $ref: '#/components/schemas/Asset'
 *         creationDate:
 *           type: number
 *         dateLastUpdated:
 *           type: number
 */
export class Class {
    @prop({required: true})
    disabled: boolean;

    @prop({
        required: true,
        trim: true
    })
    name: string;

    @prop({
        required: true,
        ref: Category
    })
    categories: Ref<Category>[];

    @prop({
        required: true,
        ref: "Asset"
    })
    image: Ref<Asset>;

    @prop({required: true})
    creationDate: number;

    @prop({required: true})
    dateLastUpdated: number;
}
export const classModel = getModelForClass(Class);