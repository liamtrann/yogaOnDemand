import {ForgotPassword} from "@/models/ForgotPassword";
import {chain} from "mathjs";

function isForgotPasswordExpired(forgotPassword: ForgotPassword): boolean {
    const expirationDate = chain(Date.now()).subtract(Number(process.env.FORGOT_PASSWORD_EXPIRATION_TIME)).done();
    return forgotPassword.creationDate < expirationDate;
}

export default isForgotPasswordExpired;