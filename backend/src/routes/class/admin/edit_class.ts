import {AdminRole} from "@/models/Admin";
import adminAuthentication from "@/middleware/authentication/adminAuthentication";
import {app} from "@/index";
import {APIError} from "@/models/APIError";
import {isNil, omitBy} from "lodash";
import {Express} from "@/global";
import {classModel} from "@/models/Class";
import {validateID} from "@/utils/validateID";
import Request = Express.Request;
import {Category, categoryModel} from "@/models/Category";

/**
 * @swagger
 * components:
 *   schemas:
 *     EditClassBody:
 *       required:
 *         - classID
 *       properties:
 *         classID:
 *           type: string
 *         name:
 *           type: string
 *         categoryIDs:
 *           type: array
 *           items:
 *             type: string
 *         imageID:
 *           type: string
 */
interface EditClassBody {
    classID: string;
    name: string;
    categoryIDs: string[];
    imageID?: string
}

/**
 * @swagger
 * /class/edit_class:
 *   put:
 *     description: Used by admins to edit a class
 *     operationId: editClass
 *     tags:
 *       - class
 *     security:
 *       - Admin: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EditClassBody'
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         $ref: '#/components/responses/APIError'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.put("/class/edit_class", adminAuthentication([AdminRole.GOD, AdminRole.STANDARD]), async (req: Request<undefined, undefined | APIError, EditClassBody>, res) => {
    const errors: string[] = [];
    const dateLastUpdated: number = Date.now();

    const {classID, name, categoryIDs, imageID} = req.body;

    //validation
    if (isNil(classID)) {
        errors.push("The class ID field was missing.");
    } else {
        const classIDErrors = validateID(classID);
        if (classIDErrors) {
            errors.push(...classIDErrors.messages);
        }
    }

    if (!isNil(categoryIDs)) {
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

    // find the class
    const classDocument = await classModel.findById(classID);
    if (isNil(classDocument)) {
        res.status(400).send({messages: ["Could not find a class with the given ID."]});
        return;
    }

    // check if the class is disabled
    if (classDocument.disabled) {
        res.status(400).send({messages: ["This class has been removed."]});
        return;
    }

    // find the categories
    let categories: Category[];
    if (isNil(categories)) {
        categories = await Promise.all(categoryIDs.map(async (categoryID: string) => {
            const category: Category = await categoryModel.findById(categoryID);
            if (isNil(category)) {
                res.status(400).send({messages: ["Could not find a category with a given ID."]});
                return;
            }

            return category;
        }));
    }

    // update the class
    await classModel.findByIdAndUpdate(classID, omitBy({
        name,
        categories,
        dateLastUpdated,
        image: imageID ? imageID : undefined,
    }, isNil))

    res.sendStatus(200);
})