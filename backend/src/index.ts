import 'module-alias/register';
import sourceMapSupport from "source-map-support";
import * as core from "express-serve-static-core";
import express from "express";
import {initMongoose} from "@/services/mongoDB";

sourceMapSupport.install();

let app: core.Express;
export {app};

(async () => {

	// init the express server
	app = express();

	// init connection to database
	await initMongoose();

	// init the middleware
	require("./middleware");

	// init the routes
	require("./routes");

	// handle 404 requests (do after all other routes, so it doesn't override them)
	require("./routes/404");

	// init the error handler (do this after the other middlewares to have a proper chain of command)
	require("./middleware/errorHandling");

	// set the server to listed on env variable PORT
	app.listen(process.env.PORT, () => {
		console.log("Backend server started.");
	});

})()

