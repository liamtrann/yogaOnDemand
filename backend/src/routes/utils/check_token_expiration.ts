import {app} from "@/index";
import {Token, tokenModel} from "@/models/Token";
import {APIError} from "@/models/APIError";
import {DocumentType} from "@typegoose/typegoose";
import {extendLastTouched, isExpired} from "@/utils/tokenUtils";
import {Express} from "@/global";
import Request = Express.Request;
import {isNil} from "lodash";

/**
 * @swagger
 * components:
 *   schemas:
 *     CheckTokenExpirationResponse:
 *       required:
 *         - expired
 *       properties:
 *         expired:
 *           type: boolean
 */
interface CheckTokenExpirationResponse {
    expired: boolean;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     TokenBody:
 *       required:
 *         - token
 *       properties:
 *         token:
 *           type: string
 */
export interface TokenBody {
    token: string
}

/**
 * @swagger
 * /utils/check_token_expiration:
 *   post:
 *     description: It takes in a token and returns a boolean if its still active. If the token is still active, then extend the token's expiration.
 *     operationId: checkTokenExpiration
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CheckTokenExpirationResponse'
 *       '400':
 *         $ref: '#/components/responses/APIError'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.post("/utils/check_token_expiration", async (req: Request<undefined, CheckTokenExpirationResponse | APIError, TokenBody>, res) => {
    const token: DocumentType<Token> = await tokenModel.findOne({token: req.body.token});
    if (isNil(token)){
        res.send({expired: true});
        return;
    }

    if (isExpired(token)) {
        res.send({expired: true})
    } else {
        await extendLastTouched(token);
        res.send({expired: false});
    }
});