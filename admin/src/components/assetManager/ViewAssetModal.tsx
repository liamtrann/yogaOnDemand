import React, {useEffect, useState} from "react";
import {Button, Modal, ModalFooter, ModalHeader} from "reactstrap";
import {Asset} from "client";
import { random } from "lodash";
import {makeRandomQueryURL} from "./AssetListItem";

interface IProps {
	isOpen: boolean;
	asset: Asset;
	onClose(madeChange: boolean): void;
}

const ViewAssetModal: React.FC<IProps> = (props: IProps) => {

	const {isOpen, asset} = props;
	const [key, setKey] = useState(1);

	useEffect(() => {
		setKey(key + 1);
	}, [JSON.stringify(asset)]);

	function closeHelper(): void {
		props.onClose(false);
	}

	return (
		<div key={key}>
			<Modal
				isOpen={isOpen}
				centered={true}
				toggle={closeHelper}
			>
				<ModalHeader toggle={closeHelper}>Viewing: {asset.name}</ModalHeader>

				<img
					src={makeRandomQueryURL(asset.url)}
					style={{maxWidth: "100%", maxHeight: "80vh", objectFit: "contain"}}
				/>

				<ModalFooter>
					<Button color="primary" onClick={closeHelper}>
						Close
					</Button>
				</ModalFooter>
			</Modal>
		</div>
	);
};

export default ViewAssetModal;
