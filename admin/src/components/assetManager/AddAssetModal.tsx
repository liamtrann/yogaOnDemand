import React, {ChangeEventHandler, useState} from "react";
import {connect} from "react-redux";
import {IStore} from "../../redux/defaultStore";
import {Button, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, UncontrolledTooltip} from "reactstrap";
import {addError, decrementLoading, incrementLoading} from "../../redux/meta/MetaActions";
import {AssetApi, CreateAssetManagerAssetRequest} from "client";
import getConfig from "../../utils/getConfig";
import {FiInfo} from "react-icons/all";

interface IProps {
	token?: string;
	dispatch?: any;
	isOpen: boolean;
	onClose(getNewData: boolean): void;
}

const defaultForm: CreateAssetManagerAssetRequest = {
	asset: undefined,
	name: "",
	description: "",
	urlExtension: "",
};

const AddAssetModal: React.FC<IProps> = (props: IProps) => {

	const {token, isOpen} = props;
	const [form, setForm] = useState<CreateAssetManagerAssetRequest>(defaultForm);

	function closeHelper(): void {
		setForm(defaultForm);
		props.onClose(false);
	}

	function createOnChange(key: keyof CreateAssetManagerAssetRequest): ChangeEventHandler<HTMLInputElement> {
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
	}

	async function addAsset(): Promise<void> {
		props.dispatch(incrementLoading());

		try {
			await new AssetApi(getConfig(token)).createAssetManagerAsset(form);

			props.dispatch(decrementLoading());
			setForm(defaultForm);
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
			<ModalHeader toggle={closeHelper}>Add New Asset</ModalHeader>

			<ModalBody>
				<div className="mb-3">
					<Label>
						Asset*
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

				<div className="mb-3">
					<Label className="d-flex align-items-center">
						Custom URL Extension <FiInfo size="1rem" style={{maxHeight: 55}} className="ml-2" id="urlExtensionTooltip"/>
						<UncontrolledTooltip placement="right" target="urlExtensionTooltip">
							OPTIONAL: Use this field to manually choose a label for this asset that will appear in its url. If nothing is entered, the url will be randomly generated. Only URL safe characters permitted (letters, numbers, hyphens, underscores)
						</UncontrolledTooltip>
					</Label>
					<Input value={form.urlExtension} placeholder="URL Extension" onChange={createOnChange("urlExtension")}/>
				</div>
			</ModalBody>

			<ModalFooter>
				<Button color="link" onClick={closeHelper} className="mr-3">
					Cancel
				</Button>
				<Button color="success" onClick={addAsset} disabled={!form.asset}>
					Add Asset
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
})(AddAssetModal);
