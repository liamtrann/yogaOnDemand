import {AdminRole} from "@/models/Admin";
import adminAuthentication from "@/middleware/authentication/adminAuthentication";
import {app} from "@/index";
import {APIError} from "@/models/APIError";
import {isNil, omitBy} from "lodash";
import {Express} from "@/global";
import {classModel} from "@/models/Class";
import {validateID} from "@/utils/validateID";
import Request = Express.Request;
import {IDBody} from "@/models/IDBody";

/**
 * @swagger
 * /class/disable_class:
 *   put:
 *     description: Used by admins to delete a class
 *     operationId: disableClass
 *     tags:
 *       - class
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
app.put("/class/disable_class", adminAuthentication([AdminRole.GOD, AdminRole.STANDARD]), async (req: Request<undefined, undefined | APIError, IDBody>, res) => {
    const errors: string[] = [];
    const dateLastUpdated: number = Date.now();

    const {id: classID} = req.body;

    //validation
    if (isNil(classID)) {
        errors.push("The class ID field was missing.");
    } else {
        const classIDErrors = validateID(classID);
        if (classIDErrors) {
            errors.push(...classIDErrors.messages);
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
        res.status(400).send({messages: ["This class has already been removed."]});
        return;
    }

    // disable the class
    await classModel.findByIdAndUpdate(classID, {disabled: true, dateLastUpdated});

    res.sendStatus(200);
})