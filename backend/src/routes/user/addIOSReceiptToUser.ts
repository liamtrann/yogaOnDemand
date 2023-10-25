import {app} from "@/index";
import userAuthentication from "@/middleware/authentication/userAuthentication";
import {Express} from "@/global";
import Request = Express.Request;
import { isNil } from "lodash";
import validateIOSReceipt from "@/utils/validateIOSReceipt";
import {userModel} from "@/models/User";

/**
 * @swagger
 * components:
 *   schemas:
 *     addIOSReceiptToUserDataRequestBody:
 *       required:
 *         - receiptData
 *       properties:
 *         receiptData:
 *           type: string
 */
interface addIOSReceiptToUserDataRequestBody {
	receiptData: string,
}

/**
 * @swagger
 * /user/add_ios_receipt_to_user:
 *   put:
 *     description: add an ios receipt to the user
 *     operationId: addIOSReceiptToUser
 *     tags:
 *       - user
 *     security:
 *       - User: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/addIOSReceiptToUserDataRequestBody'
 *     responses:
 *       '200':
 *         description: Success.
 *       '400':
 *         $ref: '#/components/responses/APIError'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */
app.put("/user/add_ios_receipt_to_user", userAuthentication(false), async (req: Request<undefined, undefined, addIOSReceiptToUserDataRequestBody>, res) => {
	if (isNil(req.body.receiptData)) {
		res.status(400).send({messages: ["No receiptData was passed in."]});
		return;
	}

	// check that the receipt is valid
	const receiptData = await validateIOSReceipt(req.body.receiptData);
	if (receiptData.status !== 0) {
		res.status(400).send({messages: ["The ios receipt was not validated from Apple."]});
		return;
	}

	await userModel.findByIdAndUpdate(req.user._id, {iosReceiptData: req.body.receiptData});

	res.sendStatus(200);
})