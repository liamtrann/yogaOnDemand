import React from "react";
import {Category, CategoryApi, Instructor, InstructorApi} from "client";
import {Button, Modal, ModalBody, ModalHeader} from "reactstrap";
import {addError, decrementLoading, incrementLoading} from "../../redux/meta/MetaActions";
import getConfig from "../../utils/getConfig";
import {connect} from "react-redux";
import {IStore} from "../../redux/defaultStore";

interface IProps {
	token?: string;
	dispatch?: any;
	isOpen: boolean;
	instructor: Instructor;
	onClose(): void;
	onDone(): Promise<void>;
}

const DisableInstructorModal: React.FC<IProps> = (props: IProps) => {

	async function disableInstructor(): Promise<void> {
		props.dispatch(incrementLoading());

		try {
			const res = await new InstructorApi(getConfig(props.token)).disableInstructor({
				iDBody: {
					id: props?.instructor?._id,
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
			<ModalHeader toggle={props.onClose}>Disable Instructor</ModalHeader>

			<ModalBody>
				<p>
					Are you sure you want to disable <b className="text-blue">{props?.instructor?.name}</b>?
				</p>

				<div className="d-flex justify-content-end">
					<Button color="blue" size="sm" onClick={disableInstructor}>
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
		...props
	}
})(DisableInstructorModal);
