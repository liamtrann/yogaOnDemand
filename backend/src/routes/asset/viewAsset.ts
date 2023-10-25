import {app} from "@/index";
import {assetBucket} from "@/services/googleStorage";

/**
 * @swagger
 * /asset/{urlExtension}:
 *   get:
 *     tags:
 *       - asset
 *     description: pipes the asset from Google Storage.
 *     operationId: viewAsset
 *     parameters:
 *       - in: path
 *         name: urlExtension
 *         schema:
 *           type: string
 *         required: true
 *         description: urlExtension of an asset
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/AssetResponse'
 *       '404':
 *         description: Not Found
 */
app.get("/asset/:urlExtension", async (req, res) => {

	// check urlExtension was passed in
	if (typeof req.params.urlExtension !== "string" || req.params.urlExtension.length < 1) {
		res.sendStatus(404);
		return;
	}

	// check google for the asset
	const file = await assetBucket.file(req.params.urlExtension);
	const exists = (await file.exists())[0];
	if (!exists) {
		res.sendStatus(404);
		return;
	}

	// create stream to pipe back
	const readStream = file.createReadStream({validation: false});
	res.status(200).set({
		'Content-Type': file.metadata.contentType,
	});
	readStream.pipe(res, {end: true})
})