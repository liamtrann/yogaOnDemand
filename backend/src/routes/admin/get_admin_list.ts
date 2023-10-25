import {app} from "@/index";
import adminAuthentication from "@/middleware/authentication/adminAuthentication";
import {Admin, adminModel, AdminRole} from "@/models/Admin";
import {Express} from "@/global";
import {APIError} from "@/models/APIError";
import Request = Express.Request;

/**
 * @swagger
 * /admin/get_admin_list:
 *   get:
 *     operationId: getAdminList
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
 *                 $ref: '#/components/schemas/Admin'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.get("/admin/get_admin_list", adminAuthentication([AdminRole.GOD, AdminRole.STANDARD]), async (req: Request<undefined, Admin[] | APIError>, res) => {
    // find all admins if GOD admin, otherwise just return their account
    let admins = [];
    switch(req.admin.adminRole) {
        case AdminRole.GOD:
            admins = await adminModel.find({});
            break;
        case AdminRole.STANDARD:
            admins.push(await adminModel.findById(req.admin._id));
            break;
        default:
            // should never get here
            res.status(400).send({messages: ["The given admin role is invalid."]});
            return;
    }

    // remove password hashes from admins before returning
    const cleanAdmins: Admin[] = admins.map(admin => ({
        _id: admin._id,
        adminRole: admin.adminRole,
        active: admin.active,
        username: admin.username,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
    }));
    res.send(cleanAdmins);
});

