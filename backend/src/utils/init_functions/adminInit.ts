import {InitFunction} from "@/routes/utils/init";
import {adminModel, AdminRole} from "@/models/Admin";
import {hashPassword} from "@/utils/passwordEncryption";

/**
 * Adds an admin, if none have been added yet
 */
const adminInit: InitFunction = async () => {
	// count the number of admins
	const count = await adminModel.countDocuments();

	// return if there is at least 1 admin
	if (count > 0) {
		return;
	}

	// add admin inside env variables
	const passwordHash = await hashPassword(process.env.ADMIN_INIT_PASSWORD);
	const adminDoc = new adminModel({
		username: process.env.ADMIN_INIT_USER,
		passwordHash,
		adminRole: AdminRole.GOD,
		active: true
	});
	await adminDoc.save();
}

export default adminInit;