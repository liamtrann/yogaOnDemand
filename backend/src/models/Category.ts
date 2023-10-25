import {getModelForClass, prop, Ref} from "@typegoose/typegoose";
import {Asset} from "@/models/Asset";

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       required:
 *         - _id
 *         - disabled
 *         - name
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
 *         image:
 *           $ref: '#/components/schemas/Asset'
 *         creationDate:
 *           type: number
 *         dateLastUpdated:
 *           type: number
 */
export class Category {
    @prop({required: true})
    disabled: boolean;

    @prop({
        required: true,
        trim: true
    })
    name: string;

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
export const categoryModel = getModelForClass(Category);