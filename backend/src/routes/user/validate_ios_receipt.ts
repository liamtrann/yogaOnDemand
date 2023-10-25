import {app} from "@/index";
import {Express} from "@/global";
import Request = Express.Request;
import {APIError} from "@/models/APIError";
import userAuthentication from "@/middleware/authentication/userAuthentication";
import validateIOSReceipt from "@/utils/validateIOSReceipt";

/**
 * @swagger
 * components:
 *   schemas:
 *     ValidateIOSReceiptRequestBody:
 *       required:
 *         - receiptData
 *       properties:
 *         receiptData:
 *           type: string
 */
interface ValidateIOSReceiptRequestBody {
	receiptData: string,
}

/**
 * @swagger
 * /user/validate_ios_receipt:
 *   post:
 *     description: get the validated receipt given the encryption
 *     operationId: validateIOSReceipt
 *     tags:
 *       - user
 *     security:
 *       - User: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ValidateIOSReceiptRequestBody'
 *     responses:
 *       '200':
 *         description: Success.
 *       '400':
 *         $ref: '#/components/responses/APIError'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.post("/user/validate_ios_receipt", userAuthentication(false), async (req: Request<undefined, any | APIError, ValidateIOSReceiptRequestBody>, res) => {
	const response = validateIOSReceipt(req.body.receiptData);
	res.send(response);
})