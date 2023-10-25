import React from "react";
import {connect} from "react-redux";
import {IStore} from "../../redux/defaultStore";
import YogaModalHeader from "./YogaModalHeader";
import {Button, Modal, ModalBody} from "reactstrap";
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

const EnableCategoryModal: React.FC<IProps> = (props: IProps) => {

	async function enableCategory(): Promise<void> {
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
			<YogaModalHeader onClose={props.onClose}>
				Enable Category
			</YogaModalHeader>

			<ModalBody>
				<p>
					Are you sure you want to enable the <b className="text-blue">{props?.category?.name}</b> category?
				</p>

				<div className="d-flex justify-content-end">
					<Button color="blue" size="sm" onClick={enableCategory}>
						Yes, Enable
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
})(EnableCategoryModal)
