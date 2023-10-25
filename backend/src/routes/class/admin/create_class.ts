import {AdminRole} from "@/models/Admin";
import adminAuthentication from "@/middleware/authentication/adminAuthentication";
import {app} from "@/index";
import {APIError} from "@/models/APIError";
import {isNil, omitBy} from "lodash";
import {getMongooseErrors} from "@/utils/mongooseError";
import {Express} from "@/global";
import {classModel} from "@/models/Class";
import Request = Express.Request;
import {validateID} from "@/utils/validateID";
import {Category, categoryModel} from "@/models/Category";
import {Asset, assetModel} from "@/models/Asset";

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateClassBody:
 *       required:
 *         - name
 *         - categoryIDs
 *         - imageID
 *       properties:
 *         name:
 *           type: string
 *         categoryIDs:
 *           type: array
 *           items:
 *             type: string
 *         imageID:
 *           type: string
 */
interface CreateClassBody {
    name: string;
    categoryIDs: string[];
    imageID: string;
}

/**
 * @swagger
 * /class/create_class:
 *   post:
 *     description: Used by admins to create a new class
 *     operationId: createClass
 *     tags:
 *       - class
 *     security:
 *       - Admin: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateClassBody'
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         $ref: '#/components/responses/APIError'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.post("/class/create_class", adminAuthentication([AdminRole.GOD, AdminRole.STANDARD]), async (req: Request<undefined, undefined | APIError, CreateClassBody>, res) => {
    const errors: string[] = [];
    const creationDate: number = Date.now();

    const {name, categoryIDs, imageID} = req.body;

    //validation
    if (isNil(name)) {
        errors.push("The name field was missing.");
    }

    if (isNil(categoryIDs)) {
        errors.push("The category IDs field was missing.");
    } else {
        for (const categoryID of categoryIDs) {
            const categoryIDErrors = validateID(categoryID);
            if (categoryIDErrors) {
                errors.push(...categoryIDErrors.messages);
            }
        }
    }

    if (isNil(imageID)) {
        errors.push("The image ID field was missing.");
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

    // find the categories
    const categories: Category[] = await Promise.all(categoryIDs.map(async (categoryID: string) => {
        const category: Category = await categoryModel.findById(categoryID);
        if (isNil(category)) {
            res.status(400).send({messages: [`Could not find a category with a given ID: ${categoryID}.`]});
            return;
        }

        return category;
    }));

    // find the image
    const image: Asset = await assetModel.findById(imageID);
    if (isNil(image)) {
        res.status(400).send({messages: ["Could not find an image with the given ID."]});
        return;
    }

    // create db document
    const classDocument = new classModel(omitBy({
        disabled: false,
        name,
        categories,
        image,
        creationDate,
        dateLastUpdated: creationDate
    }, isNil))

    // validate
    const mongooseErrors = await getMongooseErrors(classDocument);
    if (mongooseErrors) {
        res.status(400).send(mongooseErrors);
        return;
    }

    // save
    await classDocument.save();
    res.sendStatus(200);
})