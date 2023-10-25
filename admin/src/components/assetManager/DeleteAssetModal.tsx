import React from "react";
import {connect} from "react-redux";
import {IStore} from "../../redux/defaultStore";
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import {addError, decrementLoading, incrementLoading} from "../../redux/meta/MetaActions";
import {Asset} from "client";
import {makeRandomQueryURL} from "./AssetListItem";

interface IProps {
	token?: string;
	dispatch?: any;
	isOpen: boolean;
	asset: Asset;
	onClose(madeChange: boolean): void;
}

const DeleteAssetModal: React.FC<IProps> = (props: IProps) => {

	const {token, isOpen, asset} = props;

	function closeHelper(): void {
		props.onClose(false);
	}

	async function confirmDelete(): Promise<void> {
		props.dispatch(incrementLoading());
		try {
			// await new AssetApi(getConfig(token)).
		} catch (e) {
			props.dispatch(addError(e));
		}
		props.dispatch(decrementLoading());
	}

	return (
		<Modal
			isOpen={isOpen}
			centered={true}
			toggle={closeHelper}
		>
			<ModalHeader toggle={closeHelper}>Deleting: {asset.name}</ModalHeader>

			<img
				src={makeRandomQueryURL(asset.url)}
				style={{maxWidth: "100%"}}
			/>

			<ModalBody>
				<p>
					{`Are you sure you want to delete '${asset.name}'`}
					<br/>
					Doing so will remove any references to it.
				</p>
			</ModalBody>

			<ModalFooter>
				<Button color="link" className="mr-3" onClick={closeHelper}>
					Cancel
				</Button>
				<Button color="danger" onClick={confirmDelete}>
					Delete
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default connect((store: IStore, props: IProps) => {
	return {
		...props,
		token: store.metaStore.token,
	}
})(DeleteAssetModal);
