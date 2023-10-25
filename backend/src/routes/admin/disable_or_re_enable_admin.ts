import {app} from "@/index";
import adminAuthentication from "@/middleware/authentication/adminAuthentication";
import {adminModel, AdminRole} from "@/models/Admin";
import {Express} from "@/global";
import Request = Express.Request;
import {APIError} from "@/models/APIError";
import {deleteAllOwnersTokens} from "@/utils/tokenUtils";
import {validateID} from "@/utils/validateID";
import {IDBody} from "@/models/IDBody";
import {isNil} from "lodash";

/**
 * @swagger
 * /admin/disable_or_re_enable_admin:
 *   put:
 *     description: Used by GOD admins to disable/re-enable an admin's ability to log in
 *     operationId: disableOrReEnableAdmin
 *     tags:
 *       - admin
 *     security:
 *       - Admin: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IDBody'
 *     responses:
 *       '200':
 *         description: Success. Admin was disabled/re-enabled.
 *       '400':
 *         $ref: '#/components/responses/APIError'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.put("/admin/disable_or_re_enable_admin", adminAuthentication([AdminRole.GOD]), async (req: Request<undefined, undefined | APIError, IDBody>, res) => {
    const errors: string[] = [];

    // validation
    if (isNil(req.body.id)) {
        errors.push("The Admin ID field is missing.");
    }

    const idErrors = validateID(req.body.id);
    if (idErrors) {
        errors.push(...idErrors.messages);
    }

    if (errors.length > 0) {
        res.status(400).send({messages: errors});
        return;
    }

    // find admin
    const admin = await adminModel.findById(req.body.id);
    if (isNil(admin)) {
        res.status(400).send({messages: ["An admin with the given ID does not exist."]});
        return;
    }

    // check that the admin is not disabling themselves
    if (req.body.id === req.admin._id.toString()) {
        res.status(400).send({messages: ["Admins can not disable or re-enable themselves."]});
        return;
    }

    // determine if disabling or re-enabling the admin
    if (admin.active) {
        await adminModel.updateOne({_id: admin._id}, {$set: {active: false}});
        await deleteAllOwnersTokens(admin._id.toString());
    } else {
        await adminModel.updateOne({_id: admin._id}, {$set: {active: true}});
    }

    res.sendStatus(200);
});