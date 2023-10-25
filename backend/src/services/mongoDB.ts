import {Mongoose, connect} from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

let mongoose: Mongoose;

async function initMongoose() {
	if (!mongoose) {
		mongoose = await connect(
			process.env.MONGO_DB_URL,
			{
				user: process.env.MONGO_DB_USER,
				pass: process.env.MONGO_DB_PASS,
				dbName: process.env.MONGO_DB_DB_NAME,
				authSource: "admin",
				useNewUrlParser: true,
				useCreateIndex: true,
				useUnifiedTopology: true,
				autoCreate: true,
				useFindAndModify: false,
			}
		);

		mongoose.plugin(uniqueValidator);
	}

	return mongoose;
}

export {initMongoose}

