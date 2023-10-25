import {app} from "@/index";
import {tokenModel} from "@/models/Token";
import cronAuthentication from "@/middleware/authentication/cronAuthentication";
import {chain} from "mathjs";

/**
 * @swagger
 * /cron/de_authenticate_tokens:
 *   get:
 *     description: It finds all tokens that are expired and then deletes them.
 *     operationId: deAuthenticateTokens
 *     tags:
 *       - cron
 *     security:
 *       - Cron: []
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         $ref: '#/components/responses/APIError'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.get("/cron/de_authenticate_tokens", cronAuthentication, async (req, res) => {
	const oneWeekAgo = chain(Date.now()).subtract(7 * 24 * 60 * 60 * 1000).done();
	await tokenModel.deleteMany({lastTouched: {$lte: oneWeekAgo}});
	res.sendStatus(200);
});