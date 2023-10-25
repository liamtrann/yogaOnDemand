import {app} from "@/index";
import adminAuthentication from "@/middleware/authentication/adminAuthentication";
import {AdminRole} from "@/models/Admin";
import {Express} from "@/global";
import Request = Express.Request;
import {APIError} from "@/models/APIError";
import {userModel} from "@/models/User";
import {hashPassword} from "@/utils/passwordEncryption";
import {deleteAllOwnersTokens} from "@/utils/tokenUtils";
import {validateID} from "@/utils/validateID";
import {isNil} from "lodash";

/**
 * @swagger
 * components:
 *   schemas:
 *     ChangeUserPasswordBody:
 *       required:
 *         - userID
 *         - password
 *         - confirmPassword
 *       properties:
 *         userID:
 *           $ref: '#/components/schemas/_id'
 *         password:
 *           type: string
 *         confirmPassword:
 *           type: string
 */
interface ChangeUserPasswordBody {
    userID: string;
    password: string;
    confirmPassword: string;
}

/**
 * @swagger
 * /admin/change_user_password:
 *   put:
 *     description: Used by GOD admins to change user's passwords.
 *     operationId: changeUserPassword
 *     tags:
 *       - admin
 *     security:
 *       - Admin: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangeUserPasswordBody'
 *     responses:
 *       '200':
 *         description: Success. Password has been updated.
 *       '400':
 *         $ref: '#/components/responses/APIError'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.put("/admin/change_user_password", adminAuthentication([AdminRole.GOD]), async (req: Request<undefined, undefined | APIError, ChangeUserPasswordBody>, res) => {
    const errors: string[] = [];

    //validation
    if (isNil(req.body.userID)) {
        errors.push("The user id field is missing.");
    }

    if (isNil(req.body.password)) {
        errors.push("The password field is missing.");
    }

    if (isNil(req.body.confirmPassword)) {
        errors.push("The confirm password field is missing.");
    }

    if (req.body.password !== req.body.confirmPassword) {
        errors.push("The password fields do not match.");
    }

    if (req.body.password.length < 5) {
        errors.push("Password must contain at least 5 characters.");
    }

    const idErrors = validateID(req.body.userID);
    if (idErrors) {
        errors.push(...idErrors.messages);
    }

    if (errors.length > 0) {
        res.status(400).send({messages: errors});
        return;
    }

    const user = await userModel.findById(req.body.userID);
    if (!user) {
        res.status(400).send({messages: ["Could not find user with the given ID."]});
        return;
    }

    // create password hash
    const passwordHash = await hashPassword(req.body.password);

    // update user with new password hash
    await userModel.findByIdAndUpdate(req.body.userID, {"passwordHash": passwordHash});

    // de-authenticate all tokens for this user after changing passwords
    await deleteAllOwnersTokens(user._id.toString());

    res.sendStatus(200);
});