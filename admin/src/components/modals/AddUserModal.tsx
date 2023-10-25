import React, {ChangeEventHandler, useState} from "react";
import {connect} from "react-redux";
import {IStore} from "../../redux/defaultStore";
import {Button, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import {addError, decrementLoading, incrementLoading} from "../../redux/meta/MetaActions";
import {SignUpBody, UserApi} from "client";
import getConfig from "../../utils/getConfig";

interface IProps {
	token?: string;
	dispatch?: any;
	isOpen: boolean;
	onClose(getNewData: boolean): void;
}

const defaultAddUserForm: SignUpBody = {
	email: "",
	password: "",
	confirmPassword: "",
};

const AddUserModal: React.FC<IProps> = (props: IProps) => {

	const {isOpen} = props;
	const [form, setForm] = useState<SignUpBody>(defaultAddUserForm);

	function closeHelper(): void {
		setForm(defaultAddUserForm);
		props.onClose(false);
	}

	function createOnChange(key: keyof SignUpBody): ChangeEventHandler<HTMLInputElement> {
		return (e) => {
			setForm({
				...form,
				[key]: e.target.value,
			});
		}
	}

	async function submitAddNewUser(): Promise<void> {
		props.dispatch(incrementLoading());

		try {
			await new UserApi(getConfig()).signUp({signUpBody: form});
			props.dispatch(decrementLoading());
			setForm(defaultAddUserForm);
			props.onClose(true);
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
			toggle={closeHelper}
		>
			<ModalHeader toggle={closeHelper}>Add New User</ModalHeader>

			<ModalBody>
				<div className="mb-3">
					<Label>
						Email*
					</Label>
					<Input value={form.email} placeholder="Email" onChange={createOnChange("email")}/>
				</div>

				<div className="mb-3">
					<Label>
						Password*
					</Label>
					<Input type="password" value={form.password} placeholder="Password" onChange={createOnChange("password")}/>
				</div>

				<div className="mb-3">
					<Label>
						Confirm Password*
					</Label>
					<Input type="password" value={form.confirmPassword} placeholder="Confirm Password" onChange={createOnChange("confirmPassword")}/>
				</div>
			</ModalBody>

			<ModalFooter>
				<Button color="primary" onClick={submitAddNewUser}>
					Add User
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
})(AddUserModal);
