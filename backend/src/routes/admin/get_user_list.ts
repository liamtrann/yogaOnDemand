import {app} from "@/index";
import adminAuthentication from "@/middleware/authentication/adminAuthentication";
import {AdminRole} from "@/models/Admin";
import {Express} from "@/global";
import {User, userModel} from "@/models/User";
import {APIError} from "@/models/APIError";
import Request = Express.Request;

/**
 * @swagger
 * /admin/get_user_list:
 *   get:
 *     operationId: getUserList
 *     tags:
 *       - admin
 *     security:
 *       - Admin: []
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.get("/admin/get_user_list", adminAuthentication([AdminRole.GOD, AdminRole.STANDARD]), async (req: Request<undefined, User[] | APIError>, res) => {
    const users = await userModel.find({}).select("active email firstName lastName freeSubscriptionExpiration");
    res.send(users);
});

