import {app} from "@/index";
import {APIError} from "@/models/APIError";
import {isNil, omitBy} from "lodash";
import {getMongooseErrors} from "@/utils/mongooseError";
import {Express} from "@/global";
import {chain} from "mathjs";
import Request = Express.Request;
import {twilioClient} from "@/services/twilioClient";
import {User, userModel} from "@/models/User";
import {forgotPasswordModel} from "@/models/ForgotPassword";
import isForgotPasswordExpired from "@/utils/forgot_password/isForgotPasswordExpired";
import deleteExpiredForgotPasswords from "@/utils/forgot_password/deleteExpiredForgotPasswords";
import {sendGridClient} from "@/services/sendGridClient";
import {hashPassword} from "@/utils/passwordEncryption";

/**
 * @swagger
 * components:
 *   schemas:
 *     RequestForgotPasswordBody:
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 */
interface RequestForgotPasswordBody {
    email: string;
}

/**
 * @swagger
 * /user/request_forgot_password:
 *   post:
 *     description: Used by users to request a forgot password verification code
 *     operationId: requestForgotPassword
 *     tags:
 *       - user
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RequestForgotPasswordBody'
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         $ref: '#/components/responses/APIError'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.post("/user/request_forgot_password", async (req: Request<undefined, string | APIError, RequestForgotPasswordBody>, res) => {
    const currentTime = Date.now();
    const errors: string[] = [];

    if (isNil(req.body.email)) {
        errors.push("The email field was missing.");
    }

    if (errors.length > 0) {
        res.status(400).send({messages: errors});
        return;
    }

    const user = await userModel.findOne({email: req.body.email});
    if (isNil(user)) {
        res.status(400).send({messages: ["Could not find a user with the given email."]});
        return;
    }

    // check if user is disabled
    if (!user.active) {
        res.status(400).send({messages: ["This user has been disabled."]});
        return;
    }

    // check if a ForgotPassword already exists for this user
    const oldForgotPassword = await forgotPasswordModel.findOne({user});
    if (!isNil(oldForgotPassword)) {
        if (isForgotPasswordExpired(oldForgotPassword)) {
            await deleteExpiredForgotPasswords();
        } else {
            const waitTime = chain(Number(process.env.FORGOT_PASSWORD_EXPIRATION_TIME)).subtract(currentTime).add(oldForgotPassword.creationDate).divide(60000).floor().done();
            if (waitTime < 1) {
                res.status(400).send({messages: [`You have less than a minute before you can request again.`]});
            } else {
                res.status(400).send({messages: [`You have ${waitTime} minute${waitTime === 1 ? "" : "s"} before you can request again.`]});
            }
            return;
        }
    }

    // create 6 digit verification code with leading 0's
    const verificationCode = Math.floor((Math.random() * 1000000) + 1).toString().padStart(6, "0");
    const verificationCodeHash = await hashPassword(verificationCode);

    // create the ForgotPassword
    const forgotPassword = new forgotPasswordModel(omitBy({
        user,
        verificationCodeHash,
        creationDate: currentTime,
    }, isNil))

    // validate
    const mongooseErrors = await getMongooseErrors(forgotPassword);
    if (mongooseErrors) {
        res.status(400).send(mongooseErrors);
        return;
    }

    // send the email
    const timeLeft = chain(Number(process.env.FORGOT_PASSWORD_EXPIRATION_TIME)).divide(60 * 1000).done();
    const message = {
        to: user.email,
        from: 'victor.li@frameonesoftware.com',
        subject: `${process.env.REACT_APP_PROJECT_NAME} Reset Password`,
        html: `Hello ${user.firstName},<br><br><strong>${verificationCode}</strong> is your ${process.env.REACT_APP_PROJECT_NAME} verification code to create a new password. It will expire in ${timeLeft} minutes.`,
    };

    try {
        await sendGridClient.send(message);
    } catch (error) {
        console.error(error);

        if (error.response) {
            res.status(400).send({messages: [error.response.body]});
            return;
        }
    }

    // save
    await forgotPassword.save();

    res.send(forgotPassword.id);
})