import {NextFunction, Response} from "express";
import {APIError} from "@/models/APIError";
import {Token, tokenModel, TokenType} from "@/models/Token";
import {User, userModel} from "@/models/User";
import {extendLastTouched, isExpired} from "@/utils/tokenUtils";
import {DocumentType} from "@typegoose/typegoose";
import {isNil} from "lodash";
import {AdminRole} from "@/models/Admin";
import validateIOSReceipt from "@/utils/validateIOSReceipt";
import isValidIOSReceipt from "@/utils/isValidIOSReceipt";

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     User:
 *       description: Authentication for the use of user APIs. Bearer token from "/user/forms/login"
 *       type: http
 *       scheme: bearer
 */
const userAuthentication = (requiresSubscription: boolean = true) => {
	return async (req, res: Response<APIError>, next: NextFunction) => {
		// see if authorization exists in the header
		if (typeof req.headers.authorization !== "string") {
			res.status(400).send({
				messages: ["You must have a token to continue authentication."]
			});
			return;
		}

		// find token
		const tokenID = req.headers.authorization.replace("Bearer ", "");
		const token: DocumentType<Token> = await tokenModel.findOne({token: tokenID});
		if (isNil(token)) {
			res.status(400).send({
				messages: ["Your token is invalid, please log in again."],
			});
			return;
		}

		// check if token is expired
		if (isExpired(token)) {
			res.status(400).send({
				messages: ["Token is expired. Please login again."],
			});
			await tokenModel.findByIdAndDelete(token.id);
			return;
		}

		// that the token type is for users
		if (token.tokenType !== TokenType.User) {
			res.status(400).send({messages: ["Your token type is invalid"]});
			return;
		}

		// find user
		const userID = token.owner;
		const user: DocumentType<User> = await userModel.findById(userID);

		// check that user exists
		if (isNil(user)) {
			res.status(400).send({messages: ["Could not find your account."]});
			return;
		}

		// check that user is active
		if (!user.active) {
			res.status(400).send({messages: ["Your account has be disabled."]});
			return;
		}

		if (requiresSubscription) {
			let hasSubscription = false;

			// check the expiration value set on the user
			const {freeSubscriptionExpiration} = await userModel.findById(userID).select("freeSubscriptionExpiration");

			// if the freeSubscriptionExpiration is valid then allow through
			if (!isNil(freeSubscriptionExpiration) && freeSubscriptionExpiration >= Date.now()) {
				hasSubscription = true;
			}

			// check and see if ios receipt exists
			if (!hasSubscription && !isNil(user.iosReceiptData)) {
				const validation = await validateIOSReceipt(user.iosReceiptData);
				hasSubscription = await isValidIOSReceipt(validation);
			}

			if (!hasSubscription) {
				res.status(400).send({messages: ["You must have a subscription to access this content."], requiredSubscriptionError: true});
				return;
			}
		}

		// add to req
		req.user = user;
		req.token = token;

		next();

		// extend token
		await extendLastTouched(token);
	};
}

export default userAuthentication;