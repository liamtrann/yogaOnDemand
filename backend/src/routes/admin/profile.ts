import adminAuthentication from "@/middleware/authentication/adminAuthentication";
import {app} from "@/index";
import {Admin, AdminRole, adminModel} from "@/models/Admin";
import {APIError} from "@/models/APIError";
import {Express} from "@/global";
import Request = Express.Request;

/**
 * @swagger
 * /admin/profile:
 *   get:
 *     operationId: profileGet
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
 *               $ref: '#/components/schemas/Admin'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.get("/admin/profile", adminAuthentication([AdminRole.GOD, AdminRole.STANDARD]), async (req: Request<undefined, Admin | APIError>, res) => {
    // remove password hash from returned admin
    const admin = new adminModel({
        _id: req.admin._id,
        adminRole: req.admin.adminRole,
        active: req.admin.active,
        username: req.admin.username,
        firstName: req.admin.firstName,
        lastName: req.admin.lastName,
        email: req.admin.email,
    });

    res.send(admin);
});

