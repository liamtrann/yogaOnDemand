import {userModel} from "@/models/User";
import {app} from "@/index";
import {APIError} from "@/models/APIError";
import {isNil, omitBy} from "lodash";
import {hashPassword} from "@/utils/passwordEncryption";
import {getMongooseErrors} from "@/utils/mongooseError";
import {Express} from "@/global";
import Request = Express.Request;

/**
 * @swagger
 * components:
 *   schemas:
 *     SignUpBody:
 *       required:
 *         - email
 *         - password
 *         - confirmPassword
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         confirmPassword:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 */
interface SignUpBody {
    email: string;
    password: string;
    confirmPassword: string;
    firstName?: string;
    lastName?: string;
}

/**
 * @swagger
 * /user/sign_up:
 *   post:
 *     description: Used to sign up a user
 *     operationId: signUp
 *     tags:
 *       - user
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignUpBody'
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         $ref: '#/components/responses/APIError'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.post("/user/sign_up", async (req: Request<undefined, string | APIError, SignUpBody>, res) => {
    const errors: string[] = [];

    //validation
    if (isNil(req.body.email)) {
        errors.push("The email field is missing.");
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
        errors.push("The password must contain at least 5 characters.");
    }

    if (errors.length > 0) {
        res.status(400).send({messages: errors});
        return;
    }

    // create password hash
    const passwordHash = await hashPassword(req.body.password);

    // create db document
    const user = new userModel(omitBy({
        active: true,
        email: req.body.email,
        passwordHash,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        favoriteClasses: [],
    }, isNil))

    // validate
    const mongooseErrors = await getMongooseErrors(user);
    if (mongooseErrors) {
        res.status(400).send(mongooseErrors);
        return;
    }

    // save
    await user.save();

    // send the user id
    res.send(user.id);
})