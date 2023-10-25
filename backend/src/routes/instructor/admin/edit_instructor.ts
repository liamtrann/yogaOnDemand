import {AdminRole} from "@/models/Admin";
import adminAuthentication from "@/middleware/authentication/adminAuthentication";
import {app} from "@/index";
import {APIError} from "@/models/APIError";
import {isNil, omitBy} from "lodash";
import {Express} from "@/global";
import Request = Express.Request;
import {validateID} from "@/utils/validateID";
import {instructorModel} from "@/models/Instructor";
import {assetModel} from "@/models/Asset";

/**
 * @swagger
 * components:
 *   schemas:
 *     EditInstructorBody:
 *       required:
 *         - instructorID
 *         - name
 *         - description
 *         - imageID
 *       properties:
 *         instructorID:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         imageID:
 *           type: string
 */
interface EditInstructorBody {
    instructorID: string
    name: string;
    description: string;
    imageID: string
}

/**
 * @swagger
 * /instructor/edit_instructor:
 *   put:
 *     description: Used by admins to edit an instructor
 *     operationId: editInstructor
 *     tags:
 *       - instructor
 *     security:
 *       - Admin: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EditInstructorBody'
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         $ref: '#/components/responses/APIError'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.put("/instructor/edit_instructor", adminAuthentication([AdminRole.GOD, AdminRole.STANDARD]), async (req: Request<undefined, undefined | APIError, EditInstructorBody>, res) => {
    const errors: string[] = [];
    const dateLastUpdated: number = Date.now();

    const {instructorID, name, description, imageID} = req.body;

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

    // check if the instructor is disabled
    if (instructor.disabled) {
        res.status(400).send({messages: ["This instructor has been removed."]});
        return;
    }

    // find the image
    let image;
    if (!isNil(imageID)) {
        image = await assetModel.findById(imageID);
        if (isNil(image)) {
            res.status(400).send({messages: ["Could not find an image with the given ID."]});
            return;
        }
    }

    // create db document
    await instructorModel.findByIdAndUpdate(instructorID, omitBy({
        name,
        description,
        image,
        dateLastUpdated
    }, isNil))

    res.sendStatus(200);
})