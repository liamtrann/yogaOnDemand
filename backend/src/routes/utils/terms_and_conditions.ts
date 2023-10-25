import {app} from "@/index";
import * as path from "path";

/**
 * @swagger
 * /utils/terms_and_conditions:
 *   get:
 *     description: returns the privacy policy.
 *     operationId: termsAndConditions
 *     tags:
 *       - utils
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/HTMLResponse'
 */
app.get("/utils/terms_and_conditions", (req, res) => {
	res.sendFile(path.join(__dirname, '../../../files/terms_and_conditions.html'));
})