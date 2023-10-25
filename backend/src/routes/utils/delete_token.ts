import {app} from "@/index";
import {Express} from "@/global";
import Request = Express.Request;
import {APIError} from "@/models/APIError";
import {TokenBody} from "@/routes/utils/check_token_expiration";
import {tokenModel} from "@/models/Token";

/**
 * @swagger
 * /utils/delete_token:
 *   delete:
 *     description: deletes a token
 *     operationId: deleteToken
 *     tags:
 *       - utils
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TokenBody'
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         $ref: '#/components/responses/APIError'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.delete("/utils/delete_tokens", async (req: Request<undefined, APIError, TokenBody>, res) => {
    await tokenModel.deleteOne({token: req.body.token});
    res.sendStatus(200);
});