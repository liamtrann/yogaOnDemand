import {getModelForClass, prop, Ref} from "@typegoose/typegoose";
import {Asset} from "@/models/Asset";

/**
 * @swagger
 * components:
 *   schemas:
 *     Instructor:
 *       required:
 *         - _id
 *         - disabled
 *         - name
 *         - description
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
 *         description:
 *           type: string
 *         image:
 *           $ref: '#/components/schemas/Asset'
 *         creationDate:
 *           type: number
 *         dateLastUpdated:
 *           type: number
 */
export class Instructor {
    @prop({required: true})
    disabled: boolean;

    @prop({required: true})
    name: string;

    @prop({required: true})
    description: string;

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
export const instructorModel = getModelForClass(Instructor);