import {app} from "@/index";
import * as path from "path";

/**
 * @swagger
 * /utils/privacy_policy:
 *   get:
 *     description: returns the privacy policy.
 *     operationId: privacyPolicy
 *     tags:
 *       - utils
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/HTMLResponse'
 */
app.get("/utils/privacy_policy", (req, res) => {
	res.sendFile(path.join(__dirname, '../../../files/privacy_policy.html'));
})