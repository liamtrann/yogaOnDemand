import {app} from "@/index";
import {Express} from "@/global";
import Request = Express.Request;
import {APIError} from "@/models/APIError";
import {User, userModel} from "@/models/User";
import {isNil} from "lodash";
import {ForgotPassword, forgotPasswordModel} from "@/models/ForgotPassword";
import {validateID} from "@/utils/validateID";
import isForgotPasswordExpired from "@/utils/forgot_password/isForgotPasswordExpired";
import {comparePasswordToHash, hashPassword} from "@/utils/passwordEncryption";
import {tokenModel} from "@/models/Token";
import {DocumentType} from "@typegoose/typegoose";

/**
 * @swagger
 * components:
 *   schemas:
 *     ResetForgotPasswordBody:
 *       required:
 *         - newPassword
 *         - confirmPassword
 *       properties:
 *         forgotPasswordID:
 *           type: string
 *         verificationCode:
 *           type: string
 *         newPassword:
 *           type: string
 *         confirmPassword:
 *           type: string
 */
interface ResetForgotPasswordBody {
    forgotPasswordID: string
    verificationCode: string;
    newPassword: string;
    confirmPassword: string;
}

/**
 * @swagger
 * /user/reset_forgot_password:
 *   put:
 *     description: Used by users to change their password if they forgot it.
 *     operationId: resetForgotPassword
 *     tags:
 *       - user
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetForgotPasswordBody'
 *     responses:
 *       '200':
 *         description: Success. Password has been updated.
 *       '400':
 *         $ref: '#/components/responses/APIError'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.put("/user/reset_forgot_password", async (req: Request<undefined, undefined | APIError, ResetForgotPasswordBody>, res) => {
    const errors: string[] = []

    //validation
    if (isNil(req.body.forgotPasswordID)) {
        errors.push("The forgot password ID field is missing.");
    }

    if (isNil(req.body.verificationCode)) {
        errors.push("The verification code field is missing.");
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

    const idErrors = validateID(req.body.forgotPasswordID);
    if (idErrors) {
        errors.push(...idErrors.messages);
    }

    if (errors.length > 0) {
        res.status(400).send({messages: errors});
        return;
    }

    const forgotPassword: DocumentType<ForgotPassword> = await forgotPasswordModel.findById(req.body.forgotPasswordID).select("user verificationCodeHash creationDate").populate("user");
    if (isNil(forgotPassword)) {
        res.status(400).send({messages: ["The forgot password id was invalid."]});
        return;
    }

    // check if user is disabled
    if (!(forgotPassword.user as User).active) {
        res.status(400).send({messages: ["This user has been disabled."]});
        return;
    }

    if (isForgotPasswordExpired(forgotPassword)) {
        res.status(400).send({messages: ["Your verification code as expired. Please try again."]});
        return;
    }

    // check the verification code
    const isCorrectVerificationCode = await comparePasswordToHash(req.body.verificationCode, forgotPassword.get("verificationCodeHash"));
    if (!isCorrectVerificationCode) {
        res.status(400).send({messages: ["Your verification code was incorrect."]});
        return;
    }

    // create password hash
    const passwordHash = await hashPassword(req.body.newPassword);

    // update user with new password hash
    await userModel.findByIdAndUpdate((forgotPassword.user as DocumentType<User>).id, {"passwordHash": passwordHash});

    // de-authenticate all tokens except the one in use for this user
    await tokenModel.deleteMany({owner: (forgotPassword.user as DocumentType<User>).id});

    // delete the ForgotPassword
    await forgotPasswordModel.findByIdAndDelete(req.body.forgotPasswordID);

    res.sendStatus(200);
});