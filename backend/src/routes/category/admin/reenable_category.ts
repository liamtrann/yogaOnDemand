import {AdminRole} from "@/models/Admin";
import adminAuthentication from "@/middleware/authentication/adminAuthentication";
import {app} from "@/index";
import {APIError} from "@/models/APIError";
import {isNil} from "lodash";
import {Express} from "@/global";
import {validateID} from "@/utils/validateID";
import Request = Express.Request;
import {IDBody} from "@/models/IDBody";
import {categoryModel} from "@/models/Category";

/**
 * @swagger
 * /category/reenable_category:
 *   put:
 *     description: Used by admins to re-enable a category
 *     operationId: reenableCategory
 *     tags:
 *       - category
 *     security:
 *       - Admin: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IDBody'
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         $ref: '#/components/responses/APIError'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.put("/category/reenable_category", adminAuthentication([AdminRole.GOD, AdminRole.STANDARD]), async (req: Request<undefined, undefined | APIError, IDBody>, res) => {
    const errors: string[] = [];
    const dateLastUpdated: number = Date.now();

    const {id: categoryID} = req.body;

    //validation
    if (isNil(categoryID)) {
        errors.push("The category ID field was missing.");
    } else {
        const categoryIDErrors = validateID(categoryID);
        if (categoryIDErrors) {
            errors.push(...categoryIDErrors.messages);
        }
    }

    if (errors.length > 0) {
        res.status(400).send({messages: errors});
        return;
    }

    // find the category
    const category = await categoryModel.findById(categoryID);
    if (isNil(category)) {
        res.status(400).send({messages: ["Could not find a category with the given ID."]});
        return;
    }

    // check if the category is enabled
    if (category.disabled) {
        res.status(400).send({messages: ["This category has already been re-enabled."]});
        return;
    }

    // re-enable the category
    await categoryModel.findByIdAndUpdate(categoryID, {disabled: false, dateLastUpdated});

    res.sendStatus(200);
})