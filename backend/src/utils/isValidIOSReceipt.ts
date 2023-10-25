import {ValidateIOSReceiptResponse} from "@/models/ValidateIOSReceiptResponse";
import { isNil } from "lodash";

async function isValidIOSReceipt(validatedReceipt: ValidateIOSReceiptResponse): Promise<boolean> {
	let valid = false;

	// look through all valid receipts
	for (const receipt of validatedReceipt.latest_receipt_info) {

		if (
			Number(receipt.expires_date_ms) > Date.now() &&
			(receipt.cancellation_date === "" || isNil(receipt.cancellation_date))
		) {
			valid = true;
			break;
		}
	}

	return valid;
}

export default isValidIOSReceipt;
