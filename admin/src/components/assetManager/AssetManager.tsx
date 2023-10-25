import React, {ReactNode, useEffect, useState} from "react";
import {connect} from "react-redux";
import {IStore} from "../../redux/defaultStore";
import {Button, Modal, ModalBody, ModalFooter, ModalHeader, Spinner} from "reactstrap";
import AssetListItem from "./AssetListItem";
import {addError, decrementLoading, incrementLoading} from "../../redux/meta/MetaActions";
import {Asset, AssetApi} from "client";
import getConfig from "../../utils/getConfig";
import AddAssetModal from "./AddAssetModal";

interface IProps {
	token?: string;
	dispatch?: any;
	isOpen: boolean;
	allowSelect: boolean;

	onClose(e?): void;
	onSelect?(asset: Asset): void;
}

const AssetManager: React.FC<IProps> = (props: IProps) => {

	const {token, isOpen, allowSelect} = props;
	const [assets, setAssets] = useState<Array<Asset>>();
	const [showAdd, setShowAdd] = useState(false);

	useEffect(() => {
		if (isOpen) {
			readAssets().then().catch();
		}
	}, [isOpen]);

	function toggleAddModal(getNewData: boolean): void {
		setShowAdd(!showAdd);
		if (getNewData) {
			readAssets().then().catch();
		}
	}

	async function readAssets(): Promise<void> {
		props.dispatch(incrementLoading());

		try {
			const res = await new AssetApi(getConfig(token)).getAssetManagerAssets();
			setAssets(res);
		} catch (e) {
			props.dispatch(addError(e));
		}

		props.dispatch(decrementLoading());

	}

	function makeAssetList(_assets: Array<Asset> = []): ReactNode {
		return _assets.map((_asset: Asset, i: number) => {

			function onSelectHelper(): void {
				props.onSelect(_asset);
			}

			return (
				<div key={`asset-list-item-container_${i}`}>
					{i > 0 && (
						<hr/>
					)}
					<AssetListItem
						key={`asset-list-item_${i}`}
						asset={_asset}
						allowSelect={allowSelect}
						onFinishedChanges={readAssets}
						onSelect={onSelectHelper}
					/>
				</div>
			);
		});
	}

	return (
		<React.Fragment>
			<AddAssetModal
				isOpen={showAdd}
				onClose={toggleAddModal}
			/>

			<Modal
				isOpen={isOpen}
				centered={true}
				toggle={props.onClose}
				style={{maxHeight: "90vh"}}
			>
				<ModalHeader toggle={props.onClose}>Asset Manager</ModalHeader>

				<ModalBody style={{maxHeight: "80vh", overflowY: "scroll"}}>
					{assets ? (
						<React.Fragment>
							{assets.length < 1 ? (
								<div>
									<p className="text-center mb-0">
										No assets uploaded yet. Click the "Add Asset" button below to add one.
									</p>
								</div>
							) : (
								<React.Fragment>
									{makeAssetList(assets)}
								</React.Fragment>
							)}
						</React.Fragment>
					) : (
						<div className="m-4 d-flex justify-content-center">
							<div className="d-flex align-items-center">
								<Spinner size="sm" className="mr-3"/>
								Loading Assets...
							</div>
						</div>
					)}
				</ModalBody>

				<ModalFooter>
					<Button color="link" onClick={props.onClose} className="mr-3">
						Close
					</Button>
					<Button color="primary" onClick={() => {setShowAdd(true)}}>
						Add Asset
					</Button>
				</ModalFooter>
			</Modal>
		</React.Fragment>
	);
};

export default connect((store: IStore, props: IProps) => {
	return {
		...props,
		token: store.metaStore.token,
	}
})(AssetManager);
