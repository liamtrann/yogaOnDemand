import React, {useState} from "react";
import {Button} from "reactstrap";
import DeleteAssetModal from "./DeleteAssetModal";
import EditAssetModal from "./EditAssetModal";
import ViewAssetModal from "./ViewAssetModal";
import {Asset} from "client";
import {random} from "lodash";

interface IProps {
	asset: Asset;
	allowSelect: boolean;
	onFinishedChanges(): void;
	onSelect?(): void;
}

const AssetListItem: React.FC<IProps> = (props: IProps) => {

	const {asset, allowSelect} = props;
	const [showView, setShowView] = useState(false);
	const [showEdit, setShowEdit] = useState(false);
	const [showDelete, setShowDelete] = useState(false);

	function toggleShowView(): void {
		setShowView(!showView);
	}

	function toggleShowEdit(): void {
		setShowEdit(!showEdit);
	}

	function toggleShowDelete(): void {
		setShowDelete(!showDelete);
	}

	function closeSecondaryModals(madeChange: boolean = false): void {
		setShowView(false);
		setShowEdit(false);
		setShowDelete(false);

		if (madeChange) {
			props.onFinishedChanges();
		}
	}

	function makeRandomQueryURL(url: string) {
		return url + "?" + random(0, 10000);
	}

	return (
		<React.Fragment>
			<ViewAssetModal
				isOpen={showView}
				asset={asset}
				onClose={closeSecondaryModals}
			/>

			<EditAssetModal
				asset={asset}
				isOpen={showEdit}
				onClose={closeSecondaryModals}
			/>

			<DeleteAssetModal
				asset={asset}
				isOpen={showDelete}
				onClose={closeSecondaryModals}
			/>

			<div className="d-flex">
				<img
					src={makeRandomQueryURL(asset.url)}
					style={{
						width: 100,
						height: 100,
						objectFit: "cover",
						borderRadius: 5,
					}}
				/>
				<div className="ml-3 d-flex flex-column" style={{width: "calc(100% - 120px)"}}>
					<div className="text-truncate d-inline-block">
						<span className="h5">{asset.name ? asset.name : "Untitled Asset"}</span>
						<br/>
						<span className="text-secondary">{asset.description ? asset.description : "No Description"}</span>
					</div>

					<div className="mt-1">

						{allowSelect && (
							<Button color="success" className="mr-2 my-2" onClick={props.onSelect}>
								Select
							</Button>
						)}

						<Button color="primary" className="mr-2 my-2" onClick={toggleShowView}>
							View
						</Button>

						<Button color="info" className="mr-2 my-2" onClick={toggleShowEdit}>
							Edit
						</Button>

						{/*<Button color="danger" className="mr-2 my-2" onClick={toggleShowDelete}>*/}
						{/*	Delete*/}
						{/*</Button>*/}
					</div>
				</div>
			</div>
		</React.Fragment>
	);
};

export function makeRandomQueryURL(url: string) {
	return url + "?" + random(0, 10000);
}

export default AssetListItem;
