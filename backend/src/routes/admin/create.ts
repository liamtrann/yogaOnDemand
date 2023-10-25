import {AdminRole, adminModel} from "@/models/Admin";
import adminAuthentication from "@/middleware/authentication/adminAuthentication";
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
 *     CreateAdminBody:
 *       required:
 *         - adminRole
 *         - username
 *         - password
 *         - confirmPassword
 *       properties:
 *         adminRole:
 *           $ref: '#/components/schemas/AdminRole'
 *         username:
 *           type: string
 *         password:
 *           type: string
 *         confirmPassword:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *         phoneNumber:
 *           type: string
 */
interface CreateAdminBody {
    adminRole: AdminRole;
    username: string;
    password: string;
    confirmPassword: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string
}

/**
 * @swagger
 * /admin/create:
 *   post:
 *     description: Used by admins to create new admin accounts
 *     operationId: create
 *     tags:
 *       - admin
 *     security:
 *       - Admin: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAdminBody'
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         $ref: '#/components/responses/APIError'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.post("/admin/create", adminAuthentication([AdminRole.GOD]), async (req: Request<undefined, undefined | APIError, CreateAdminBody>, res) => {
    const errors: string[] = [];

    //validation
    if (isNil(req.body.adminRole)) {
        errors.push("The admin role field is missing.");
    }

    if (isNil(req.body.username)) {
        errors.push("The username field is missing.");
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

    if (!Object.values(AdminRole).includes(req.body.adminRole)) {
        errors.push(`'${req.body.adminRole}' is a not a valid admin role.`);
    }

    if (errors.length > 0) {
        res.status(400).send({messages: errors});
        return;
    }

    // create password hash
    const passwordHash = await hashPassword(req.body.password);

    // create db document
    const admin = new adminModel(omitBy({
        adminRole: req.body.adminRole,
        active: true,
        username: req.body.username,
        passwordHash,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
    }, isNil))

    // validate
    const mongooseErrors = await getMongooseErrors(admin);
    if (mongooseErrors) {
        res.status(400).send(mongooseErrors);
        return;
    }

    // save
    await admin.save();
    res.sendStatus(200);
})