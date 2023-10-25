import {app} from "@/index";
import adminAuthentication from "@/middleware/authentication/adminAuthentication";
import {AdminRole} from "@/models/Admin";
import {Express} from "@/global";
import Request = Express.Request;
import {APIError} from "@/models/APIError";
import {userModel} from "@/models/User";
import {validateID} from "@/utils/validateID";
import {isNil} from "lodash";

/**
 * @swagger
 * components:
 *   schemas:
 *     GiveFreeSubscriptionBody:
 *       required:
 *         - userID
 *         - freeSubscriptionExpiration
 *       properties:
 *         userID:
 *           $ref: '#/components/schemas/_id'
 *         freeSubscriptionExpiration:
 *           type: number
 */
interface GiveFreeSubscriptionBody {
    userID: string;
    freeSubscriptionExpiration: number;
}

/**
 * @swagger
 * /admin/give_free_subscription:
 *   put:
 *     description: Used by GOD admins to give user's free subscriptions.
 *     operationId: giveFreeSubscription
 *     tags:
 *       - admin
 *     security:
 *       - Admin: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GiveFreeSubscriptionBody'
 *     responses:
 *       '200':
 *         description: Success. Gave free subscription.
 *       '400':
 *         $ref: '#/components/responses/APIError'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.put("/admin/give_free_subscription", adminAuthentication([AdminRole.GOD]), async (req: Request<undefined, undefined | APIError, GiveFreeSubscriptionBody>, res) => {
    const errors: string[] = [];
    const {userID, freeSubscriptionExpiration} = req.body;

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

    if (isNil(freeSubscriptionExpiration)) {
        errors.push("The free subscription expiration field was missing.");
    } else if (typeof freeSubscriptionExpiration !== "number") {
        errors.push("The free subscription expiration field was invalid.");
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

    // update user with the free subscription expiration date
    await userModel.findByIdAndUpdate(userID, {freeSubscriptionExpiration});

    res.sendStatus(200);
});