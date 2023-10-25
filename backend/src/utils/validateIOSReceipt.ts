import { ValidateIOSReceiptResponse } from "@/models/ValidateIOSReceiptResponse";
import axios from "axios";

async function validateIOSReceipt(receiptEncoding: string): Promise<ValidateIOSReceiptResponse> {
	let verifyResponse = await axios.post("https://buy.itunes.apple.com/verifyReceipt", {
		"receipt-data": receiptEncoding,
		password: process.env.IOS_APP_SECRET,
		"exclude-old-transactions": true,
	});

	// sandbox environment check
	if (verifyResponse?.data?.status === 21007) {
		verifyResponse = await axios.post("https://sandbox.itunes.apple.com/verifyReceipt", {
			"receipt-data": receiptEncoding,
			password: process.env.IOS_APP_SECRET,
			"exclude-old-transactions": true,
		});
	}

	return verifyResponse.data;
}

export default validateIOSReceipt;