import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import {IStore} from "../../redux/defaultStore";
import {Button, Input, Label, Modal, ModalBody, ModalHeader} from "reactstrap";
import {addError, decrementLoading, incrementLoading} from "../../redux/meta/MetaActions";
import {Asset, Instructor, InstructorApi} from "client";
import getConfig from "../../utils/getConfig";
import AssetManager from "../assetManager/AssetManager";

interface IProps {
	token?: string;
	dispatch?: any;
	isOpen: boolean;
	instructor: Instructor;
	onClose(): void;
	onDone(): Promise<void>;
}

const EditInstructorModal: React.FC<IProps> = (props) => {

	const [name, setName] = useState("");
	const [asset, setAsset] = useState<Asset>(null);
	const [description, setDescription] = useState("");
	const [showAssetManager, setShowAssetManager] = useState(false);

	useEffect(() => {
		if (props.isOpen && Object.keys(props.instructor).length > 0) {
			setName(props.instructor.name);
			setAsset(props.instructor.image);
			setDescription(props.instructor.description);
		}
	}, [props.isOpen])

	function resetAndClose(): void {
		setName("");
		setAsset(null);
		setDescription("");
		props.onClose();
	}

	function onNameChange(e): void {
		setName(e.target.value);
	}

	function onAssetChange(a: Asset): void {
		setAsset(a);
		setShowAssetManager(false);
	}

	function onDescriptionChange(e): void {
		setDescription(e.target.value);
	}

	function toggleAssetManager(): void {
		setShowAssetManager(!showAssetManager);
	}

	async function saveInstructor(): Promise<void> {
		props.dispatch(incrementLoading());

		try {
			await new InstructorApi(getConfig(props.token)).editInstructor({
				editInstructorBody: {
					name,
					description,
					imageID: asset._id,
					instructorID: props.instructor._id,
				},
			});
			props.dispatch(decrementLoading());
			props.onClose();
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
				<ModalHeader toggle={resetAndClose}>Edit Instructor</ModalHeader>

				<ModalBody>

					<Label>Instructor Name</Label>
					<Input value={name} placeholder="Instructor Name..." onChange={onNameChange} className="mb-3"/>

					<Label>Set a Picture</Label>
					{asset && (
						<img
							src={asset.url}
							style={{maxWidth: "100%", objectFit: "contain"}}
							className="my-2"
						/>
					)}
					<div className="d-flex align-items-center mb-3">
						<Button color="blue" size="sm" onClick={toggleAssetManager} className="mr-3">Choose File</Button>
						{asset && (
							<span>
								{asset.name}
							</span>
						)}
					</div>

					<Label>Instructor Description</Label>
					<Input
						type="textarea"
						value={description}
						placeholder="Instructor Description..."
						onChange={onDescriptionChange}
						className="mb-3"
					/>

					<div className="d-flex justify-content-center mt-4">
						<Button color="blue" size="sm" className="px-5" onClick={saveInstructor}>
							Save Instructor
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
})(EditInstructorModal)
