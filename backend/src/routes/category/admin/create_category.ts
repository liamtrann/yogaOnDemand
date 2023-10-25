import {AdminRole} from "@/models/Admin";
import adminAuthentication from "@/middleware/authentication/adminAuthentication";
import {app} from "@/index";
import {APIError} from "@/models/APIError";
import {isNil, omitBy} from "lodash";
import {getMongooseErrors} from "@/utils/mongooseError";
import {Express} from "@/global";
import {categoryModel} from "@/models/Category";
import Request = Express.Request;
import {validateID} from "@/utils/validateID";
import {DocumentType} from "@typegoose/typegoose";
import {Asset, assetModel} from "@/models/Asset";

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateCategoryBody:
 *       required:
 *         - name
 *         - imageID
 *       properties:
 *         name:
 *           type: string
 *         imageID:
 *           type: string
 */
interface CreateCategoryBody {
    name: string;
    imageID: string
}

/**
 * @swagger
 * /category/create_category:
 *   post:
 *     description: Used by admins to create a new category
 *     operationId: createCategory
 *     tags:
 *       - category
 *     security:
 *       - Admin: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCategoryBody'
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         $ref: '#/components/responses/APIError'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.post("/category/create_category", adminAuthentication([AdminRole.GOD, AdminRole.STANDARD]), async (req: Request<undefined, undefined | APIError, CreateCategoryBody>, res) => {
    const errors: string[] = [];
    const creationDate: number = Date.now();

    const {name, imageID} = req.body;

    //validation
    if (isNil(name)) {
        errors.push("The name field was missing.");
    } else if (typeof name !== "string") {
        errors.push("The name field was invalid.");
    }

    if (isNil(imageID)) {
        errors.push("The image ID field was missing.");
    } else if (typeof imageID !== "string") {
        errors.push("The image ID field was invalid.");
    } else {
        const imageIDErrors = validateID(imageID);
        if (imageIDErrors) {
            errors.push(...imageIDErrors.messages);
        }
    }

    if (errors.length > 0) {
        res.status(400).send({messages: errors});
        return;
    }

    // find the image
    const image: DocumentType<Asset> = await assetModel.findById(imageID);
    if (isNil(image)) {
        res.status(400).send({messages: ["Could not find an image with the given ID."]});
        return;
    }

    // create db document
    const category = new categoryModel(omitBy({
        disabled: false,
        name,
        image,
        creationDate,
        dateLastUpdated: creationDate
    }, isNil))

    // validate
    const mongooseErrors = await getMongooseErrors(category);
    if (mongooseErrors) {
        res.status(400).send(mongooseErrors);
        return;
    }

    // save
    await category.save();
    res.sendStatus(200);
})