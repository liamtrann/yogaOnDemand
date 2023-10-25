import React from "react";
import {connect} from "react-redux";
import {IStore} from "../../redux/defaultStore";
import YogaModalHeader from "./YogaModalHeader";
import {Button, Modal, ModalBody, ModalHeader} from "reactstrap";
import {Category, CategoryApi} from "client";
import {addError, decrementLoading, incrementLoading} from "../../redux/meta/MetaActions";
import getConfig from "../../utils/getConfig";

interface IProps {
	token?: string;
	dispatch?: any;
	isOpen: boolean;
	category: Category;
	onClose(): void;
	onDone(): Promise<void>;
}

const DisableCategoryModal: React.FC<IProps> = (props: IProps) => {

	async function disableCategory(): Promise<void> {
		props.dispatch(incrementLoading());

		try {
			const res = await new CategoryApi(getConfig(props.token)).disableCategory({
				iDBody: {
					id: props?.category?._id,
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
		<Modal
			isOpen={props.isOpen}
			fade={true}
			centered={true}
			toggle={props.onClose}
		>
			<ModalHeader toggle={props.onClose}>Disable Category</ModalHeader>

			<ModalBody>
				<p>
					Are you sure you want to disable the <b className="text-blue">{props?.category?.name}</b> category?
				</p>

				<div className="d-flex justify-content-end">
					<Button color="blue" size="sm" onClick={disableCategory}>
						Yes, Disable
					</Button>
				</div>
			</ModalBody>
		</Modal>
	);
};

export default connect((store: IStore, props: IProps) => {
	return {
		token: store.metaStore.token,
		...props,
	}
})(DisableCategoryModal)
