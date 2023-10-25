import {chain} from "mathjs";
import {DocumentType, getClassForDocument} from "@typegoose/typegoose";
import {Token, tokenModel, TokenType} from "@/models/Token";
import {Document} from "mongoose";
import crypto from "crypto";
import {User} from "@/models/User";
import {Admin} from "@/models/Admin";

/**
 * Creates a new token.
 * Note: This function does not save the token for you, you must do that yourself.
 * @param document
 */
async function createNewToken(document: Document): Promise<Document> {
    const documentClass = getClassForDocument(document);

    // determine token type from document type
    let tokenType: TokenType;
    switch (documentClass) {
        case (User):
            tokenType = TokenType.User;
            break;
        case (Admin):
            tokenType = TokenType.Admin;
            break;
        default:
            throw new Error("Document was invalid");
    }

    const tokenString = crypto.randomBytes(256).toString("hex");

    return new tokenModel({
        tokenType,
        owner: document,
        token: tokenString,
        timesExtended: 0,
        lastTouched: Date.now(),
    });
}

function isExpired(token: DocumentType<Token>): boolean {
    // token is expired if it has been one week since it was last touched
    const oneWeekAgo = chain(Date.now()).subtract(7 * 24 * 60 * 60 * 1000).done();
    return oneWeekAgo > token.lastTouched;
}

async function extendLastTouched(token: DocumentType<Token>): Promise<void> {
    const oneHourAgo = chain(Date.now()).subtract(60 * 60 * 1000).done();
    if (token.lastTouched < oneHourAgo) {
        await tokenModel.updateOne({token: token.token}, {$set: {lastTouched: Date.now()}, $inc: {timesExtended: 1}});
    }
}

async function deleteAllOwnersTokens(owner: string) {
    await tokenModel.deleteMany({owner});
}

export {createNewToken, isExpired, extendLastTouched, deleteAllOwnersTokens};