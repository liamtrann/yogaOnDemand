import {app} from "@/index";
import adminAuthentication from "@/middleware/authentication/adminAuthentication";
import {AdminRole} from "@/models/Admin";
import {Express} from "@/global";
import Request = Express.Request;
import {APIError} from "@/models/APIError";
import {userModel} from "@/models/User";
import {deleteAllOwnersTokens} from "@/utils/tokenUtils";
import {validateID} from "@/utils/validateID";
import {IDBody} from "@/models/IDBody";
import {isNil} from "lodash";

/**
 * @swagger
 * /admin/disable_or_re_enable_user:
 *   put:
 *     description: Used by GOD admins to disable/re-enable an user's ability to log in
 *     operationId: disableOrReEnableUser
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
 *         description: Success. User was re-enabled or disabled.
 *       '400':
 *         $ref: '#/components/responses/APIError'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.put("/admin/disable_or_re_enable_user", adminAuthentication([AdminRole.GOD, AdminRole.STANDARD]), async (req: Request<undefined, undefined | APIError, IDBody>, res) => {
    const errors: string[] = [];

    // validation
    if (isNil(req.body.id)) {
        errors.push("The user ID field is missing.");
    }

    const idErrors = validateID(req.body.id);
    if (idErrors) {
        errors.push(...idErrors.messages);
    }

    if (errors.length > 0) {
        res.status(400).send({messages: errors});
        return;
    }

    // find user
    const user = await userModel.findById(req.body.id);
    if (isNil(user)) {
        res.status(400).send({messages: ["A user with the given ID does not exist"]});
        return;
    }

    // determine if disabling or re-enabling the user
    if (user.active) {
        await userModel.updateOne({_id: user._id}, {$set: {active: false}});
        await deleteAllOwnersTokens(user._id.toString());
    } else {
        await userModel.updateOne({_id: user._id}, {$set: {active: true}});
    }

    res.sendStatus(200);
});