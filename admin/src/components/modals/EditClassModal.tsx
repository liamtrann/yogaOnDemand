import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import {IStore} from "../../redux/defaultStore";
import AssetManager from "../assetManager/AssetManager";
import {Button, Input, Label, Modal, ModalBody, ModalHeader} from "reactstrap";
import {Asset, Category, CategoryApi, Class, ClassApi, Instructor} from "client";
import {cloneDeep, findIndex} from "lodash";
import SelectedPills, {IPillOption} from "../Selectedpills";
import {addError, decrementLoading, incrementLoading} from "../../redux/meta/MetaActions";
import getConfig from "../../utils/getConfig";
import Select from "react-select";

interface IProps {
	token?: string;
	dispatch?: any;
	isOpen: boolean;
	class: Class;
	onClose(): void;
	onDone(): Promise<void>;
}

const EditClassModal: React.FC<IProps> = (props) => {

	const [name, setName] = useState("");
	const [selectedCategories, setSelectedCategories] = useState<Array<{value: string, label: string}>>([]);
	const [asset, setAsset] = useState<Asset>(null);
	const [apiCategories, setApiCategories] = useState<Array<Category>>([]);
	const [showAssetManager, setShowAssetManager] = useState(false);

	useEffect(() => {
		if (props.isOpen && Object.keys(props.class).length > 0) {
			setName(props.class.name);
			setSelectedCategories(props.class.categories.map((_category) => {
				return {value: _category._id, label: _category.name}
			}));
			setAsset(props.class.image);
		}

		if (props.isOpen) {
			getCategories().then().catch();
		}
	}, [props.isOpen]);

	/**
	 * Call api to inflate the categories drop down
	 *
	 */
	async function getCategories(): Promise<void> {
		props.dispatch(incrementLoading());

		try {
			const res = await new CategoryApi(getConfig(props.token)).getCategories({
				limit: 0,
				offset: 0,
			});

			setApiCategories(res.categories);
		} catch (e) {
			props.dispatch(addError(e));
		}

		props.dispatch(decrementLoading());
	}

	function resetAndClose(): void {
		setName("");
		setSelectedCategories([]);
		setAsset(null);
		props.onClose();
	}

	function onNameChange(e): void {
		setName(e.target.value);
	}

	function onAssetChange(a: Asset): void {
		setAsset(a);
		setShowAssetManager(false);
	}

	function toggleAssetManager(): void {
		setShowAssetManager(!showAssetManager);
	}

	async function saveClass(): Promise<void> {
		props.dispatch(incrementLoading());

		try {
			await new ClassApi(getConfig(props.token)).editClass({
				editClassBody: {
					classID: props.class._id,
					name,
					categoryIDs: selectedCategories.map((_category) => {
						return _category.value;
					}),
					imageID: asset._id,
				},
			});
			props.dispatch(decrementLoading());
			props.onClose();
			await props.onDone();
		} catch (e) {
			props.dispatch(addError(e));
		}

		props.dispatch(decrementLoading());
	}

	function handleSelection(e: {value: string, label: string}): void {
		const newSelectedCategories = cloneDeep(selectedCategories);
		newSelectedCategories.push(e);
		setSelectedCategories(newSelectedCategories);
	}

	function removeCategory(_category: IPillOption): void {
		const newSelectedCategories = cloneDeep(selectedCategories);
		const index: number = findIndex(selectedCategories, _category);
		newSelectedCategories.splice(index, 1);
		setSelectedCategories(newSelectedCategories);
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
				<ModalHeader toggle={resetAndClose}>Edit Class</ModalHeader>
				<ModalBody>
					<Label>Class Name</Label>
					<Input
						placeholder="Enter Class Name..."
						value={name}
						onChange={onNameChange}
						className="mb-3"
					/>

					<Label>Set a Category or Categories</Label>
					<div className="react-select-parent">
						<Select
							value={""}
							closeMenuOnSelect={true}
							options={apiCategories.map((_category: Category) => {
								return {
									value: _category._id,
									label: _category.name,
								}
							}).filter((_category) => {
								return findIndex(selectedCategories, _category) < 0;
							})}
							onChange={handleSelection}
						/>
					</div>
					<div className="my-3">
						<SelectedPills
							list={selectedCategories}
							onClick={removeCategory}
						/>
					</div>

					<Label>Set a Thumbnail</Label>
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
						<Button color="blue" size="sm" className="px-5" onClick={saveClass}>
							Update Class
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
})(EditClassModal);
