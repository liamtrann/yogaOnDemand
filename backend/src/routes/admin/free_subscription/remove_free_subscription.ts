import {app} from "@/index";
import adminAuthentication from "@/middleware/authentication/adminAuthentication";
import {AdminRole} from "@/models/Admin";
import {Express} from "@/global";
import Request = Express.Request;
import {APIError} from "@/models/APIError";
import {userModel} from "@/models/User";
import {validateID} from "@/utils/validateID";
import {isNil} from "lodash";
import {IDBody} from "@/models/IDBody";

/**
 * @swagger
 * /admin/remove_free_subscription:
 *   put:
 *     description: Used by GOD admins to remove user's free subscriptions.
 *     operationId: removeFreeSubscription
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
 *         description: Success. removed free subscription.
 *       '400':
 *         $ref: '#/components/responses/APIError'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.put("/admin/remove_free_subscription", adminAuthentication([AdminRole.GOD]), async (req: Request<undefined, undefined | APIError, IDBody>, res) => {
    const errors: string[] = [];
    const {id: userID} = req.body;

    //validation
    if (isNil(userID)) {
        errors.push("The user id field is missing.");
    } else if (typeof userID !== "string") {
        errors.push("The user id field was invalid.");
    } else {
        const idErrors = validateID(userID);
        if (idErrors) {
            errors.push(...idErrors.messages);
        }
    }

    if (errors.length > 0) {
        res.status(400).send({messages: errors});
        return;
    }

    // find the user
    const user = await userModel.findById(userID);
    if (isNil(user)) {
        res.status(400).send({messages: ["Could not find a user with the given ID."]});
        return;
    }

    // update user to removed the free subscription
    await userModel.findByIdAndUpdate(userID, {$unset: {freeSubscriptionExpiration: true}});

    res.sendStatus(200);
});