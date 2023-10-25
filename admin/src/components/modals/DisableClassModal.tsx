import React from "react";
import {connect} from "react-redux";
import {Class, ClassApi} from "client";
import {IStore} from "../../redux/defaultStore";
import {Button, Modal, ModalBody, ModalHeader} from "reactstrap";
import {addError, decrementLoading, incrementLoading} from "../../redux/meta/MetaActions";
import getConfig from "../../utils/getConfig";

interface IProps {
	token?: string;
	dispatch?: any;
	isOpen: boolean;
	class: Class;
	onClose(): void;
	onDone(): Promise<void>;
}

const DisableClassModal: React.FC<IProps> = (props) => {

	async function disableClass(): Promise<void> {
		props.dispatch(incrementLoading());

		try {
			await new ClassApi(getConfig(props.token)).disableClass({
				iDBody: {
					id: props?.class?._id,
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
			<ModalHeader toggle={props.onClose}>Disable Class</ModalHeader>

			<ModalBody>
				<p>
					Are you sure you want to disable the <b className="text-blue">{props?.class?.name}</b> class?
				</p>

				<div className="d-flex justify-content-end">
					<Button color="blue" size="sm" onClick={disableClass}>
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
})(DisableClassModal);
