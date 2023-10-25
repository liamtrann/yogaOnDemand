import {AdminRole} from "@/models/Admin";
import adminAuthentication from "@/middleware/authentication/adminAuthentication";
import {app} from "@/index";
import {APIError} from "@/models/APIError";
import {isNil, omitBy} from "lodash";
import {Express} from "@/global";
import {validateID} from "@/utils/validateID";
import Request = Express.Request;
import {categoryModel} from "@/models/Category";
import {DocumentType} from "@typegoose/typegoose";
import {Asset, assetModel} from "@/models/Asset";

/**
 * @swagger
 * components:
 *   schemas:
 *     EditCategoryBody:
 *       required:
 *         - categoryID
 *         - name
 *         - imageID
 *       properties:
 *         categoryID:
 *           type: string
 *         name:
 *           type: string
 *         imageID:
 *           type: string
 */
interface EditCategoryBody {
    categoryID: string;
    name: string;
    imageID: string;
}

/**
 * @swagger
 * /category/edit_category:
 *   put:
 *     description: Used by admins to edit a category
 *     operationId: editCategory
 *     tags:
 *       - category
 *     security:
 *       - Admin: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EditCategoryBody'
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         $ref: '#/components/responses/APIError'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.put("/category/edit_category", adminAuthentication([AdminRole.GOD, AdminRole.STANDARD]), async (req: Request<undefined, undefined | APIError, EditCategoryBody>, res) => {
    const errors: string[] = [];
    const dateLastUpdated: number = Date.now();

    const {categoryID, name, imageID} = req.body;

    //validation
    if (isNil(categoryID)) {
        errors.push("The category ID field was missing.");
    } else if (typeof categoryID !== "string") {
        errors.push("The category ID field was invalid.");
    } else {
        const categoryIDErrors = validateID(categoryID);
        if (categoryIDErrors) {
            errors.push(...categoryIDErrors.messages);
        }
    }

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
        res.status(400).send({messages: ["Could not find an asset with the given ID."]});
        return;
    }

    // find the category
    const category = await categoryModel.findById(categoryID);
    if (isNil(category)) {
        res.status(400).send({messages: ["Could not find a category with the given ID."]});
        return;
    }

    // edit the category
    await categoryModel.findByIdAndUpdate(categoryID, omitBy({
        name,
        image,
        dateLastUpdated
    }, isNil))

    res.sendStatus(200);
})