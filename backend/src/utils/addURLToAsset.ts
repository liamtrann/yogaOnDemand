import {DocumentType, getClassForDocument} from "@typegoose/typegoose";
import {Asset, assetModel} from "@/models/Asset";

export function addURLtoAsset(asset: DocumentType<Asset> | Asset): Asset & {url: string} {

	// check if a documentType
	let assetObject: Asset;
	try {
		if (getClassForDocument(asset as DocumentType<Asset>) === Asset) {
			assetObject = (asset as DocumentType<Asset>).toJSON();
		} else {
			assetObject = asset;
		}
	} catch {
		assetObject = asset
	}

	if (!asset) {
		return assetObject as Asset & {url: string};
	}

	return {
		...assetObject,
		url: process.env.REACT_APP_BACKEND_URL + "/asset/" + asset.urlExtension,
	}
}
