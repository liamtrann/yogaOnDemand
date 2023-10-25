import {Token, tokenModel, TokenType} from "@/models/Token";
import {NextFunction, Response} from "express";
import {APIError} from "@/models/APIError";
import {Admin, adminModel} from "@/models/Admin";
import {User, userModel} from "@/models/User";
import {extendLastTouched, isExpired} from "@/utils/tokenUtils";
import {DocumentType} from "@typegoose/typegoose";
import {isNil} from "lodash";
import validateIOSReceipt from "@/utils/validateIOSReceipt";
import isValidIOSReceipt from "@/utils/isValidIOSReceipt";

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     TokenDependant:
 *       description: Authentication for the use of APIs available anyone with an active token, it depends on a list of the tokenTypes passed into the API
 *       type: http
 *       scheme: bearer
 */

const tokenTypeAuthentication = (tokenTypes: TokenType[], requiresSubscription = false) => async (req, res: Response<APIError>, next: NextFunction) => {
    if (typeof req.headers.authorization !== "string") {
        res.status(400).send({
            messages: ["You must have a token to continue."]
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
        tokenModel.findByIdAndDelete(token.id);
        return;
    }

    // check tokenType
    if (!tokenTypes.includes(token.tokenType)) {
        res.status(400).send({messages: [`Your token type: ${token.tokenType} does not have permission to use this API.`]})
        return;
    }

    // inflate the req response with the appropriate user doc
    const owner = token.owner;
    switch(token.tokenType) {
        case(TokenType.Admin):
            const admin: DocumentType<Admin> = await adminModel.findById(owner);

            // check that admin exists
            if (isNil(admin)) {
                res.status(400).send({messages: ["Could not find your account."]});
                return;
            }

            // check that admin is active
            if (!admin.active) {
                res.status(400).send({messages: ["Your account has be disabled."]});
                return;
            }

            req.admin = admin;
            break;
        case(TokenType.User):
            const user: DocumentType<User> = await userModel.findById(owner);

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
                const {freeSubscriptionExpiration} = await userModel.findById(owner).select("freeSubscriptionExpiration");

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

            req.user = user;

            break;
        default: // should never get here
            res.status(400).send({messages: ["Token type was invalid."]})
            return;
    }

    // add token to req
    req.token = token;

    next();

    // extend token
    await extendLastTouched(token);
};

export default tokenTypeAuthentication;