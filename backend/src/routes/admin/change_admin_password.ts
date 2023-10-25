import {app} from "@/index";
import adminAuthentication from "@/middleware/authentication/adminAuthentication";
import {adminModel, AdminRole} from "@/models/Admin";
import {Express} from "@/global";
import Request = Express.Request;
import {APIError} from "@/models/APIError";
import {hashPassword} from "@/utils/passwordEncryption";
import {deleteAllOwnersTokens} from "@/utils/tokenUtils";
import {tokenModel} from "@/models/Token";
import {validateID} from "@/utils/validateID";
import {isNil} from "lodash";

/**
 * @swagger
 * components:
 *   schemas:
 *     ChangeAdminPasswordBody:
 *       required:
 *         - adminID
 *         - password
 *         - confirmPassword
 *       properties:
 *         adminID:
 *           $ref: '#/components/schemas/_id'
 *         password:
 *           type: string
 *         confirmPassword:
 *           type: string
 */
interface ChangeAdminPasswordBody {
    adminID: string;
    password: string;
    confirmPassword: string;
}

/**
 * @swagger
 * /admin/change_admin_password:
 *   put:
 *     description: Used by admins to change their passwords. Also used by GOD admins to change other admin passwords.
 *     operationId: changeAdminPassword
 *     tags:
 *       - admin
 *     security:
 *       - Admin: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangeAdminPasswordBody'
 *     responses:
 *       '200':
 *         description: Success. Password has been updated.
 *       '400':
 *         $ref: '#/components/responses/APIError'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.put("/admin/change_admin_password", adminAuthentication([AdminRole.GOD, AdminRole.STANDARD]), async (req: Request<undefined, undefined | APIError, ChangeAdminPasswordBody>, res) => {
    const errors: string[] = [];

    //validation
    if (isNil(req.body.adminID)) {
        errors.push("The admin ID field is missing.");
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

    const idErrors = validateID(req.body.adminID);
    if (idErrors) {
        errors.push(...idErrors.messages);
    }

    if (errors.length > 0) {
        res.status(400).send({messages: errors});
        return;
    }

    const admin = await adminModel.findById(req.body.adminID);
    if (isNil(admin)) {
        res.status(400).send({messages: ["Could not find an admin with the given id."]});
        return;
    }

    if (req.admin.adminRole !== AdminRole.GOD && req.admin._id.toString() !== req.body.adminID.toString()) {
        res.status(400).send({messages: ["Non-god admins can not change the passwords of other admins."]});
        return;
    }

    // create password hash
    const passwordHash = await hashPassword(req.body.password);

    // update admin with new password hash
    await adminModel.findByIdAndUpdate(req.body.adminID, {"passwordHash": passwordHash});

    // de-authenticate all tokens except the one in use if this admin is changing their own password
    // de-authenticate all if they are changing another admin's password
    if (req.admin._id.toString() !== req.body.adminID.toString()) {
        await deleteAllOwnersTokens(admin._id.toString());
    } else {
        await tokenModel.deleteMany({owner: admin._id, token: {$ne: req.token.token}});
    }

    res.sendStatus(200);
});