import {AdminRole} from "@/models/Admin";
import adminAuthentication from "@/middleware/authentication/adminAuthentication";
import {app} from "@/index";
import {APIError} from "@/models/APIError";
import {isNil} from "lodash";
import {Express} from "@/global";
import Request = Express.Request;
import {validateID} from "@/utils/validateID";
import {instructorModel} from "@/models/Instructor";
import {IDBody} from "@/models/IDBody";

/**
 * @swagger
 * /instructor/disable_instructor:
 *   put:
 *     description: Used by admins to delete an instructor
 *     operationId: disableInstructor
 *     tags:
 *       - instructor
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
app.put("/instructor/disable_instructor", adminAuthentication([AdminRole.GOD, AdminRole.STANDARD]), async (req: Request<undefined, undefined | APIError, IDBody>, res) => {
    const errors: string[] = [];
    const dateLastUpdated: number = Date.now();

    const {id: instructorID} = req.body;

    //validation
    if (isNil(instructorID)) {
        errors.push("The instructor ID field was missing.");
    } else {
        const instructorIDErrors = validateID(instructorID);
        if (instructorIDErrors) {
            errors.push(...instructorIDErrors.messages);
        }
    }

    if (errors.length > 0) {
        res.status(400).send({messages: errors});
        return;
    }

    // check that the instructor exists
    const instructor = await instructorModel.findById(instructorID);
    if (isNil(instructor)) {
        res.status(400).send({messages: ["Could not find an instructor with the given ID."]});
        return;
    }

    // check if the instructor is already disabled
    if (instructor.disabled) {
        res.status(400).send({messages: ["This instructor was already removed."]});
        return;
    }

    // disable the instructor
    await instructorModel.findByIdAndUpdate(instructorID, {disabled: true, dateLastUpdated})

    res.sendStatus(200);
})