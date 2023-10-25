import React from "react";
import {connect} from "react-redux";
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import {IStore} from "../../redux/defaultStore";
import {addError, decrementLoading, incrementLoading} from "../../redux/meta/MetaActions";
import {AdminApi, User} from "client";
import getConfig from "../../utils/getConfig";

interface IProps {
	token?: string;
	dispatch?: any;
	isOpen: boolean;
	user: User,
	onClose(): void;
	onDone(): void;
}

const DisableUserModal: React.FC<IProps> = (props: IProps) => {

	const {token, isOpen, user} = props;

	async function disableUser(): Promise<void> {
		props.dispatch(incrementLoading());

		try {
			await new AdminApi(getConfig(token)).disableOrReEnableUser({iDBody: {id: user._id}});
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
			<ModalHeader toggle={props.onClose}>Disable User</ModalHeader>

			<ModalBody>
				<p>
					Disabling this user will stop them from accessing the platform.
				</p>
			</ModalBody>

			<ModalFooter>
				<Button color="danger" onClick={disableUser}>
					Confirm, Disable User
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
})(DisableUserModal);
