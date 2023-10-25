import React, {useState} from "react";
import {connect} from "react-redux";
import {IStore} from "../../redux/defaultStore";
import {Button, Input, Label, Modal, ModalBody, ModalHeader} from "reactstrap";
import {addError, decrementLoading, incrementLoading} from "../../redux/meta/MetaActions";
import {Asset, Category, CategoryApi} from "client";
import getConfig from "../../utils/getConfig";
import YogaModalHeader from "./YogaModalHeader";
import AssetManager from "../assetManager/AssetManager";

interface IProps {
	token?: string;
	dispatch?: any;
	isOpen: boolean;
	category: Category;
	onClose(): void;
	onDone(): Promise<void>;
}

const EditCategoryModal: React.FC<IProps> = (props: IProps) => {

	const [name, setName] = useState(props?.category?.name);
	const [asset, setAsset] = useState<Asset>(props?.category?.image);
	const [showAssetManager, setShowAssetManager] = useState(false);

	function resetAndClose(): void {
		setName(props?.category?.name);
		props.onClose();
	}

	function onChangeName(e): void {
		setName(e.target.value)
	}

	function onAssetChange(a: Asset): void {
		setAsset(a);
		setShowAssetManager(false);
	}

	function toggleAssetManager(): void {
		setShowAssetManager(!showAssetManager);
	}

	async function saveCategory(): Promise<void> {
		props.dispatch(incrementLoading());

		try {
			const res = await new CategoryApi(getConfig(props.token)).editCategory({
				editCategoryBody: {
					categoryID: props.category?._id,
					name,
					imageID: asset?._id,
				},
			});
			props.dispatch(decrementLoading());
			resetAndClose();
			await props.onDone();
		} catch (e) {
			props.dispatch(decrementLoading());
			props.dispatch(addError(e));
		}

	}

	return (
		<React.Fragment>
			<AssetManager
				isOpen={showAssetManager}
				allowSelect={true}
				onClose={toggleAssetManager}
				onSelect={onAssetChange}
			/>

			<Modal
				isOpen={props.isOpen}
				fade={true}
				centered={true}
				toggle={resetAndClose}
			>
				<ModalHeader toggle={resetAndClose}>Edit Category</ModalHeader>

				<ModalBody>
					<Label>Category Name</Label>
					<Input
						placeholder="Set Category Name..."
						value={name}
						onChange={onChangeName}
						className="mb-3"
					/>

					<Label>Set a Picture</Label>
					{asset && (
						<div className="image-thumbnail-container my-2">
							<img
								src={asset.url}
							/>
						</div>
					)}
					<div className="d-flex align-items-center mb-3">
						<Button color="blue" size="sm" onClick={toggleAssetManager} className="mr-3">Choose File</Button>
						{asset && (
							<span>
								{asset.name}
							</span>
						)}
					</div>


					<div className="d-flex justify-content-center mt-4">
						<Button color="blue" size="sm" className="px-5" onClick={saveCategory}>
							Save Category
						</Button>
					</div>
				</ModalBody>
			</Modal>
		</React.Fragment>
	);
};

export default connect((store: IStore, props: IProps) => {
	return {
		token: store.metaStore.token,
		...props,
	}
})(EditCategoryModal);
