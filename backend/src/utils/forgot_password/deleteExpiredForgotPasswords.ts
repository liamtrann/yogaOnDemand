import {chain} from "mathjs";
import {forgotPasswordModel} from "@/models/ForgotPassword";

async function deleteExpiredForgotPasswords() {
    await forgotPasswordModel.deleteMany({creationDate: {$lt: chain(Date.now()).subtract(Number(process.env.FORGOT_PASSWORD_EXPIRATION_TIME)).done()}});
}

export default deleteExpiredForgotPasswords;