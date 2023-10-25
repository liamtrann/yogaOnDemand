import {app} from "@/index";
import {Express} from "@/global";
import Request = Express.Request;
import {APIError} from "@/models/APIError";
import {userModel} from "@/models/User";
import userAuthentication from "@/middleware/authentication/userAuthentication";
import {isNil} from "lodash";

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateNameBody:
 *       required:
 *         - firstName
 *         - lastName
 *       properties:
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 */
interface UpdateNameBody {
    firstName: string;
    lastName: string;
}

/**
 * @swagger
 * /user/update_name:
 *   put:
 *     description: Used by users to update their name.
 *     operationId: updateName
 *     tags:
 *       - user
 *     security:
 *       - User: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateNameBody'
 *     responses:
 *       '200':
 *         description: Success. Name has been updated.
 *       '400':
 *         $ref: '#/components/responses/APIError'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.put("/user/update_name", userAuthentication(false), async (req: Request<undefined, undefined | APIError, UpdateNameBody>, res) => {
    const errors: string[] = [];

    //validation
    if (isNil(req.body.firstName)) {
        errors.push("Missing first name field.");
    }

    if (isNil(req.body.lastName)) {
        errors.push("Missing lastName field.");
    }

    const user = await userModel.findById(req.user._id);
    if (isNil(user)) {
        errors.push("Could not find user.");
    }

    if (errors.length > 0) {
        res.status(400).send({messages: errors});
        return;
    }

    // update user with new names
    await userModel.findByIdAndUpdate(user._id, {firstName: req.body.firstName, lastName: req.body.lastName});

    res.sendStatus(200);
});