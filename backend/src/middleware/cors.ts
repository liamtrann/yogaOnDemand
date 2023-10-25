import cors from "cors";
import {app} from "@/index";

const whiteList: string[] = [
	process.env.REACT_APP_ADMIN_URL,
	process.env.REACT_APP_DOCS_URL,
].filter(s => s !== undefined && s !== null);

app.use(cors({
	origin: (origin, callback) => {
		// if (whiteList.indexOf(origin) !== -1 || !origin) {
			callback(null, true);
		// } else {
		// 	const errMessage = `origin: ${origin}, Not allowed by CORS`;
		// 	callback(new Error(errMessage));
		// }
	},
}));