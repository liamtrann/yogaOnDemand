import {User} from "@/models/User";
import {DocumentType} from "@typegoose/typegoose";
import {Admin} from "./models/Admin";
import * as core from "express-serve-static-core";
import {Request as _Request} from "express";
import {Token} from "@/models/Token";

declare namespace Express {
	export interface Request<P extends core.Params = core.ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = core.Query> extends _Request<P, ResBody, ReqBody, ReqQuery> {
		admin?: DocumentType<Admin>;
		user?: DocumentType<User>;
		token?: DocumentType<Token>;
	}
}