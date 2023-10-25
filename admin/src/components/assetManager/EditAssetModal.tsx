import React, {ChangeEventHandler, useState} from "react";
import {connect} from "react-redux";
import {IStore} from "../../redux/defaultStore";
import {Button, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import {addError, decrementLoading, incrementLoading} from "../../redux/meta/MetaActions";
import {Asset, AssetApi, UpdateAssetManagerAssetRequest} from "client";
import getConfig from "../../utils/getConfig";
import {makeRandomQueryURL} from "./AssetListItem";

interface IProps {
	token?: string;
	dispatch?: any;
	isOpen: boolean;
	asset: Asset;
	onClose(madeChange: boolean): void;
}

const EditAssetModal: React.FC<IProps> = (props: IProps) => {

	const {token, isOpen, asset} = props;
	const [form, setForm] = useState<Partial<UpdateAssetManagerAssetRequest>>({
		name: asset.name,
		description: asset.description,
	});
	const [newAssetDisplay, setNewAssetDisplay] = useState();

	function closeHelper(): void {
		setForm({
			name: asset.name,
			description: asset.description,
		});
		props.onClose(false);
	}

	function createOnChange(key: keyof UpdateAssetManagerAssetRequest): ChangeEventHandler<HTMLInputElement> {
		return (e) => {
			setForm({
				...form,
				[key]: e.target.value,
			});
		}
	}

	function onFileChange(e): void {
		setForm({
			...form,
			asset: e.target.files[0],
		});
		getNewAssetDisplay(e.target.files[0]);
	}

	function getNewAssetDisplay(file: any): any {
		if (!file) {
			setNewAssetDisplay(null);
			return;
		}
		const reader = new FileReader();
		reader.onloadend = function() {
			setNewAssetDisplay(reader.result as any);
		};
		reader.readAsDataURL(file);
	}

	async function confirmEditing(): Promise<void> {
		props.dispatch(incrementLoading());

		try {
			await new AssetApi(getConfig(token)).updateAssetManagerAsset({...form, asset: form.asset, id: asset._id} as UpdateAssetManagerAssetRequest);
			props.dispatch(decrementLoading());
			props.onClose(true);
		} catch (e) {
			props.dispatch(decrementLoading());
			props.dispatch(addError(e));
		}
	}

	return (
		<Modal
			isOpen={isOpen}
			centered={true}
			toggle={closeHelper}
		>
			<ModalHeader toggle={closeHelper}>Editing: {asset.name}</ModalHeader>

			<img
				src={form.asset ? newAssetDisplay : makeRandomQueryURL(asset.url)}
				style={{maxWidth: "100%"}}
			/>

			<ModalBody>
				<div className="mb-3">
					<Label>
						Replace File
					</Label>
					<Input type="file" placeholder="Asset" onChange={onFileChange}/>
				</div>

				<div className="mb-3">
					<Label>
						Asset Name
					</Label>
					<Input value={form.name} placeholder="Asset Name" onChange={createOnChange("name")}/>
				</div>

				<div className="mb-3">
					<Label>
						Asset Description
					</Label>
					<Input value={form.description} placeholder="Description" onChange={createOnChange("description")}/>
				</div>
			</ModalBody>

			<ModalFooter>
				<Button color="link" className="mr-3" onClick={closeHelper}>
					Cancel
				</Button>
				<Button color="success" onClick={confirmEditing}>
					Save
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
})(EditAssetModal)
