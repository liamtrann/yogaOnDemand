import {User, userModel} from "@/models/User";
import {app} from "@/index";
import {Token, TokenType} from "@/models/Token";
import {APIError} from "@/models/APIError";
import {comparePasswordToHash} from "@/utils/passwordEncryption";
import {Express} from "@/global";
import Request = Express.Request;
import {createNewToken} from "@/utils/tokenUtils";
import {isNil} from "lodash";
import {DocumentType} from "@typegoose/typegoose";

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginBody:
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 */
interface LoginBody {
    email: string;
    password: string;
}

/**
 * @swagger
 * /user/user_login:
 *   post:
 *     description: Used to login a user account. Returns a token if successful
 *     operationId: userLogin
 *     tags:
 *       - user
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginBody'
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Token'
 *       '400':
 *         $ref: '#/components/responses/APIError'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.post("/user/user_login", async (req: Request<undefined, Token | APIError, LoginBody>, res) => {
    const errors: string[] = [];

    //validation
    if (isNil(req.body.email)) {
        errors.push("The email field was missing.");
    }

    if (isNil(req.body.password)) {
        errors.push("The password field was missing.");
    }

    if (errors.length > 0) {
        res.status(400).send({messages: errors});
        return;
    }

    // check if user exists
    const user: DocumentType<User> = await userModel.findOne({email: req.body.email}).select("passwordHash active");
    if (isNil(user)) {
        res.status(400).send({messages: ["The username and/or password was incorrect."]});
        return;
    }

    // check if user is disabled
    if (!user.active) {
        res.status(400).send({messages: ["This user has been disabled and is unable to login."]});
        return;
    }

    // check if password is correct
    const isCorrectPassword = await comparePasswordToHash(req.body.password, user.get("passwordHash"));
    if (!isCorrectPassword) {
        res.status(400).send({messages: ["The username and/or password was incorrect."]});
        return;
    }

    // make token
    const token = await createNewToken(user);
    await token.save();

    // send token
    res.send({
        token: token.toObject().token
    });
})