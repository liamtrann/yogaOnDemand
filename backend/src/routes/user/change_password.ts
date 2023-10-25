import {app} from "@/index";
import {Express} from "@/global";
import Request = Express.Request;
import {APIError} from "@/models/APIError";
import {userModel} from "@/models/User";
import {comparePasswordToHash, hashPassword} from "@/utils/passwordEncryption";
import userAuthentication from "@/middleware/authentication/userAuthentication";
import {tokenModel} from "@/models/Token";
import {isNil} from "lodash";

/**
 * @swagger
 * components:
 *   schemas:
 *     ChangePasswordBody:
 *       required:
 *         - oldPassword
 *         - newPassword
 *         - confirmPassword
 *       properties:
 *         oldPassword:
 *           type: string
 *         newPassword:
 *           type: string
 *         confirmPassword:
 *           type: string
 */
interface ChangePasswordBody {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

/**
 * @swagger
 * /user/change_password:
 *   put:
 *     description: Used by users to change their passwords.
 *     operationId: changePassword
 *     tags:
 *       - user
 *     security:
 *       - User: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordBody'
 *     responses:
 *       '200':
 *         description: Success. Password has been updated.
 *       '400':
 *         $ref: '#/components/responses/APIError'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.put("/user/change_password", userAuthentication(false), async (req: Request<undefined, undefined | APIError, ChangePasswordBody>, res) => {
    const errors: string[] = []

    //validation
    if (isNil(req.body.oldPassword)) {
        errors.push("The old password field is missing.");
    }

    if (isNil(req.body.newPassword)) {
        errors.push("The new password field is missing.");
    }

    if (isNil(req.body.confirmPassword)) {
        errors.push("The confirm password field is missing.");
    }

    // check that the new password and the confirm password match
    if (req.body.newPassword !== req.body.confirmPassword) {
        errors.push("The password fields do not match.");
    }

    if (req.body.newPassword.length < 5) {
        errors.push("The password must contain at least 5 characters.");
    }

    // check if user is disabled
    if (!req.user.active) {
        errors.push("This user has been disabled and is unable to login.");
    }

    // check if the old password is correct
    const isCorrectPassword = await comparePasswordToHash(req.body.oldPassword, req.user.get("passwordHash"));
    if (!isCorrectPassword) {
        errors.push("The old password is incorrect.");
    }

    if (errors.length > 0) {
        res.status(400).send({messages: errors});
        return;
    }

    // create password hash
    const passwordHash = await hashPassword(req.body.newPassword);

    // update user with new password hash
    await userModel.findByIdAndUpdate(req.user._id, {"passwordHash": passwordHash});

    // de-authenticate all tokens except the one in use for this user
    await tokenModel.deleteMany({owner: req.user._id, token: {$ne: req.token.token}});

    res.sendStatus(200);
});