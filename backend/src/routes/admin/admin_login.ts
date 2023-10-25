import {comparePasswordToHash} from "@/utils/passwordEncryption";
import {createNewToken} from "@/utils/tokenUtils";
import {Token} from "@/models/Token";
import {adminModel} from "@/models/Admin";
import {APIError} from "@/models/APIError";
import {app} from "@/index";
import {Express} from "@/global";
import Request = Express.Request;
import {isNil} from "lodash";

/**
 * @swagger
 * components:
 *   schemas:
 *     AdminLoginBody:
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *         password:
 *           type: string
 */
interface AdminLoginBody {
    username: string;
    password: string;
}

/**
 * @swagger
 * /admin/admin_login:
 *   post:
 *     description: Used to login an admin account. Returns a token if successful
 *     operationId: adminLogin
 *     tags:
 *       - admin
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminLoginBody'
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
app.post("/admin/admin_login", async (req: Request<undefined, Token | APIError, AdminLoginBody>, res) => {
    const errors: string[] = [];

    // validation
    if (isNil(req.body.username)) {
        errors.push("The username field is missing.");
    }

    if (isNil(req.body.password)) {
        errors.push("The password field is missing.");
    }

    if (errors.length > 0) {
        res.status(400).send({messages: errors});
        return;
    }

    // check if admin exists
    const admin = await adminModel.findOne({username: req.body.username}).select("passwordHash active");
    if (isNil(admin)) {
        res.status(400).send({messages: ["The username and/or password is incorrect."]});
        return;
    }

    // check if admin is disabled
    if (!admin.active) {
        res.status(400).send({messages: ["This admin has been disabled and is unable to login."]});
        return;
    }

    // check if password is correct
    const isCorrectPassword = await comparePasswordToHash(req.body.password, admin.get("passwordHash"));
    if (!isCorrectPassword) {
        res.status(400).send({messages: ["The username and/or password is incorrect."]});
        return;
    }

    // make token
    const token = await createNewToken(admin);
    await token.save();

    // send token
    res.send({
        token: token.toObject().token
    });
});