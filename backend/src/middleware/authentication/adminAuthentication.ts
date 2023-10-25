import {Admin, adminModel, AdminRole} from "@/models/Admin";
import {NextFunction, Response} from "express";
import {APIError} from "@/models/APIError";
import {Token, tokenModel, TokenType} from "@/models/Token";
import {extendLastTouched, isExpired} from "@/utils/tokenUtils";
import {DocumentType} from "@typegoose/typegoose";
import {isNil} from "lodash";

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     Admin:
 *       description: Authentication for the use of admin APIs. Bearer token from "/admin/forms/login"
 *       type: http
 *       scheme: bearer
 */
const adminAuthentication = (roles: AdminRole[]) => {
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

        // that the token type is for admins
        if (token.tokenType !== TokenType.Admin) {
            res.status(400).send({messages: ["Your token type is invalid"]});
            return;
        }

        // find admin
        const adminID = token.owner;
        const admin: DocumentType<Admin> = await adminModel.findById(adminID);

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

        // add to req
        req.admin = admin;
        req.token = token;

        // check roles
        if (!roles.includes(req.admin.adminRole)) {
            res.status(400).send({
                messages: [`Your admin type: ${req.admin.adminRole} does not have permission to use this API.`]
            });
            return;
        }

        next();

        // extend token
        await extendLastTouched(token);
    };
};

export default adminAuthentication;