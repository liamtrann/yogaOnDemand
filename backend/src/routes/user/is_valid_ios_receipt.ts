import {app} from "@/index";
import {Express} from "@/global";
import Request = Express.Request;
import {APIError} from "@/models/APIError";
import userAuthentication from "@/middleware/authentication/userAuthentication";
import validateIOSReceipt from "@/utils/validateIOSReceipt";
import {ValidateIOSReceiptResponse} from "@/models/ValidateIOSReceiptResponse";
import isValidIOSReceipt from "@/utils/isValidIOSReceipt";

/**
 * @swagger
 * components:
 *   schemas:
 *     IsValidIOSReceiptRequestBody:
 *       required:
 *         - receiptData
 *       properties:
 *         receiptData:
 *           type: string
 */
interface IsValidIOSReceiptRequestBody {
	receiptData: string,
}

/**
 * @swagger
 * components:
 *   schemas:
 *     IsValidIOSReceiptResponse:
 *       required:
 *         - receiptData
 *       properties:
 *         valid:
 *           type: boolean
 */
interface IsValidIOSReceiptResponse {
	valid: boolean,
}

/**
 * @swagger
 * /user/is_valid_ios_receipt:
 *   post:
 *     description: returns true if the receipt is valid
 *     operationId: isValidIOSReceipt
 *     tags:
 *       - user
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IsValidIOSReceiptRequestBody'
 *     responses:
 *       '200':
 *         description: Success.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IsValidIOSReceiptResponse'
 *       '400':
 *         $ref: '#/components/responses/APIError'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.post("/user/is_valid_ios_receipt", async (req: Request<undefined, IsValidIOSReceiptResponse | APIError, IsValidIOSReceiptRequestBody>, res) => {
	try {
		const response = await validateIOSReceipt(req.body.receiptData);
		const valid = await isValidIOSReceipt(response);
		res.send({valid});
	} catch (e) {
		console.error("err", e);
		res.status(400).send({messages: ["An unexpected error occurred checking the account on the device."]})
		return;
	}

})