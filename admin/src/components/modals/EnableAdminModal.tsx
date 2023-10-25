import React from "react";
import {connect} from "react-redux";
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import {IStore} from "../../redux/defaultStore";
import {addError, decrementLoading, incrementLoading} from "../../redux/meta/MetaActions";
import {Admin, AdminApi} from "client";
import getConfig from "../../utils/getConfig";

interface IProps {
	token?: string;
	dispatch?: any;
	isOpen: boolean;
	admin: Admin;
	onClose(): void;
	onDone(): void;
}

const EnableAdminModal: React.FC<IProps> = (props: IProps) => {

	const {token, isOpen, admin} = props;

	async function enableAdmin(): Promise<void> {
		props.dispatch(incrementLoading());

		try {
			await new AdminApi(getConfig(token)).disableOrReEnableAdmin({iDBody: {id: admin._id}});
			props.dispatch(decrementLoading());
			props.onDone();
		} catch (e) {
			props.dispatch(decrementLoading());
			props.dispatch(addError(e));
		}
	}

	return (
		<Modal
			isOpen={isOpen}
			fade={true}
			centered={true}
			toggle={props.onClose}
		>
			<ModalHeader toggle={props.onClose}>Enable Admin</ModalHeader>

			<ModalBody>
				<p>
					Enabling this admin will grant them all the ability to perform all tasks allowed by their current Admin Role.
				</p>
			</ModalBody>

			<ModalFooter>
				<Button color="success" onClick={enableAdmin}>
					Confirm, Enable Admin
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
})(EnableAdminModal);
