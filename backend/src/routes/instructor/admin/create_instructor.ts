import {AdminRole} from "@/models/Admin";
import adminAuthentication from "@/middleware/authentication/adminAuthentication";
import {app} from "@/index";
import {APIError} from "@/models/APIError";
import {isNil, omitBy} from "lodash";
import {getMongooseErrors} from "@/utils/mongooseError";
import {Express} from "@/global";
import Request = Express.Request;
import {validateID} from "@/utils/validateID";
import {instructorModel} from "@/models/Instructor";
import {chain} from "mathjs";
import {assetModel} from "@/models/Asset";

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateInstructorBody:
 *       required:
 *         - name
 *         - description
 *         - imageID
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         imageID:
 *           type: string
 */
interface CreateInstructorBody {
    name: string;
    description: string;
    imageID: string
}

/**
 * @swagger
 * /instructor/create_instructor:
 *   post:
 *     description: Used by admins to create a new instructor
 *     operationId: createInstructor
 *     tags:
 *       - instructor
 *     security:
 *       - Admin: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateInstructorBody'
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         $ref: '#/components/responses/APIError'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.post("/instructor/create_instructor", adminAuthentication([AdminRole.GOD, AdminRole.STANDARD]), async (req: Request<undefined, undefined | APIError, CreateInstructorBody>, res) => {
    const errors: string[] = [];
    const creationDate: number = Date.now();

    const {name, description, imageID} = req.body;

    //validation
    if (isNil(name)) {
        errors.push("The name field was missing.");
    }

    if (isNil(description)) {
        errors.push("The description field was missing.");
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

    // find the image
    const image = await assetModel.findById(imageID);
    if (isNil(image)) {
        res.status(400).send({messages: ["Could not find an image with the given ID."]});
        return;
    }

    // create db document
    const instructor = new instructorModel(omitBy({
        disabled: false,
        name,
        description,
        image,
        creationDate,
        dateLastUpdated: creationDate
    }, isNil))

    // validate
    const mongooseErrors = await getMongooseErrors(instructor);
    if (mongooseErrors) {
        res.status(400).send(mongooseErrors);
        return;
    }

    // save
    await instructor.save();
    res.sendStatus(200);
})