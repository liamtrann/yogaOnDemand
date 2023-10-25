import React, {ReactNode, useEffect, useState} from "react";
import {removeError} from "../redux/meta/MetaActions";
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import {connect} from "react-redux";
import {IStore} from "../redux/defaultStore";
import {FiMail, FiPhoneCall} from "react-icons/all";
import {APIError} from "client";

/* Main Error Modal Manager */

interface IProps {
	errors?: Array<APIError>;
}

const ErrorModalManager: React.FC<IProps> = (props: IProps) => {

	const modals: Array<ReactNode> = props.errors.map((e: APIError, i: number) => { // todo
		return (
			<ErrorModal
				key={`error-modal_${i}`}
				errors={e.messages}
				index={i}
			/>
		);
	});

	return (
		<React.Fragment>
			{modals}
		</React.Fragment>
	);
};

/* Individual Modals */

interface IErrorModalProps {
	errors: string[];
	index: number;
	dispatch?: any;
}

const _ErrorModal: React.FC<IErrorModalProps> = (props: IErrorModalProps) => {

	const {errors, index} = props;
	const [open, setOpen] = useState(false);
	const [showContactModal, setShowContactModal] = useState(false);

	useEffect(() => {
		if (!open) {
			setOpen(true);
		}
	}, [JSON.stringify(errors), index]);

	function dismiss(): void {
		setOpen(false);
		props.dispatch(removeError(index));
	}

	function toggleContactModal(): void {
		setShowContactModal(!showContactModal);
	}

	function createErrors(_errors: string[]): ReactNode {
		return _errors.map((e: string, i: number) => {
			return (
				<p key={`error-message_${i}`}>{e}</p>
			);
		});
	}

	return (
		<React.Fragment>

			<ContactModal isOpen={showContactModal} toggle={toggleContactModal}/>

			<Modal
				isOpen={open}
				centered={true}
			>
				<ModalHeader>Error</ModalHeader>
				<ModalBody>{createErrors(errors)}</ModalBody>
				<ModalFooter>
					<Button color="info" onClick={toggleContactModal}>Contact Support</Button>
					<Button color="primary" onClick={dismiss}>Dismiss</Button>
				</ModalFooter>
			</Modal>
		</React.Fragment>
	);
};

const ErrorModal = connect()(_ErrorModal);

/* Contact/Support Modal */

interface IContactModalProps {
	isOpen: boolean;
	toggle(): void;
}

const ContactModal: React.FC<IContactModalProps> = (props: IContactModalProps) => {

	return (
		<Modal
			isOpen={props.isOpen}
			centered={true}
			toggle={props.toggle}
		>
			<ModalHeader toggle={props.toggle}>Contact Support</ModalHeader>
			<ModalBody>
				<p>Need to get in touch with Frame One Software? Text, call, or email us any time.</p>
				<div className="mb-3">
					<a href="tel:6043195219" className="text-info text-decoration-none">
						<FiPhoneCall size="1.5rem" style={{maxHeight: 55}} className="mr-3"/>
						(604) 319-5219
					</a>
				</div>
				<div>
					<a href="mailto:christopher@frameonesoftware.com?subject=Frame One Software Support" target="_blank" className="text-info text-decoration-none">
						<FiMail size="1.5rem" style={{maxHeight: 55}} className="mr-3"/>
						Christopher@frameonesoftware.com
					</a>
				</div>
			</ModalBody>
			<ModalFooter>
				<Button color="primary" onClick={props.toggle}>Close</Button>
			</ModalFooter>
		</Modal>
	)
};

export default connect((store: IStore, props: IProps) => {
	return {
		...props,
		errors: store.metaStore.errors,
	}
})(ErrorModalManager);
