import {app} from "@/index";
import axios from "axios";
import {assetBucket} from "@/services/googleStorage";

/**
 * @swagger
 * components:
 *   schemas:
 *     AssetBase64Response:
 *       description: the base64 response for an asset
 *       required:
 *         - data
 *       properties:
 *         data:
 *           type: string
 */

/**
 * @swagger
 * /asset_base64/{urlExtension}:
 *   get:
 *     tags:
 *       - asset
 *     description: Gets the base64 of a particular asset.
 *     operationId: viewAssetBase64
 *     parameters:
 *       - in: path
 *         name: urlExtension
 *         schema:
 *           type: string
 *         required: true
 *         description: urlExtension of the asset
 *     responses:
 *       '200':
 *         description: Ok
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssetBase64Response'
 *       '404':
 *         description: Not Found
 */
app.get("/asset_base64/:urlExtension", async (req, res) => {

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

	// get data as base64
	const url = await file.getSignedUrl({action: "read", expires: Date.now() + 60000});
	const response = await axios.get(url[0], { responseType: 'arraybuffer' });
	const base64 = `data:${file.metadata.contentType};base64,` + Buffer.from(response.data, 'binary').toString('base64');
	res.send({data: base64});
})