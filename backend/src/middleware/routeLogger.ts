import {app} from "@/index";

app.use((req, res, next) => {
	const start = process.hrtime();

	res.on("finish", () => {
		const duration = process.hrtime(start);
		const ms = duration[0] * 1000 + duration[1] / 1e6;
		console.log(res.statusCode, req.path, req.method, ':', ms.toFixed(0) + 'ms');
	});

	next();
});