import {app} from "@/index";
import cronAuthentication from "@/middleware/authentication/cronAuthentication";
import deleteExpiredForgotPasswords from "@/utils/forgot_password/deleteExpiredForgotPasswords";
import deleteUnusedVideoSources from "@/utils/deleteUnusedVideoSources";

/**
 * @swagger
 * /cron/delete_expired_temporary_data:
 *   get:
 *     description: Finds and deletes all of the expired or unused data
 *     operationId: deleteExpiredTemporaryData
 *     tags:
 *       - cron
 *     security:
 *       - Cron: []
 *     responses:
 *       '200':
 *         description: Deleted expired temporary data
 *       '400':
 *         $ref: '#/components/responses/APIError'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.get("/cron/delete_expired_temporary_data", cronAuthentication, async (req, res) => {
    await Promise.all([
        deleteExpiredForgotPasswords,
        deleteUnusedVideoSources,
    ])

    res.sendStatus(200);
});