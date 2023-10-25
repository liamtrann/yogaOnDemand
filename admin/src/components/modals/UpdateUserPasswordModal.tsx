import React, {ChangeEventHandler, useState} from "react";
import {connect} from "react-redux";
import {IStore} from "../../redux/defaultStore";
import {Button, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import {AdminApi, ChangeUserPasswordBody, User} from "client";
import {addError, decrementLoading, incrementLoading} from "../../redux/meta/MetaActions";
import getConfig from "../../utils/getConfig";

interface IProps {
	token?: string;
	dispatch?: any;
	isOpen: boolean;
	user: User;
	onClose(): void;
	onDone(): void;
}

const  defaultUpdateUserPasswordForm: Partial<ChangeUserPasswordBody> = {
	password: "",
	confirmPassword: "",
};

const UpdateUserPasswordModal: React.FC<IProps> = (props: IProps) => {

	const {token, isOpen, user} = props;
	const [form, setForm] = useState<Partial<ChangeUserPasswordBody>>(defaultUpdateUserPasswordForm);

	function closeHelper(): void {
		setForm(defaultUpdateUserPasswordForm);
		props.onClose();
	}

	function createOnChange(key: keyof ChangeUserPasswordBody): ChangeEventHandler<HTMLInputElement> {
		return (e) => {
			setForm({
				...form,
				[key]: e.target.value,
			});
		}
	}

	async function submitUpdateUserPassword(): Promise<void> {
		props.dispatch(incrementLoading());

		try {
			await new AdminApi(getConfig(token)).changeUserPassword({
				changeUserPasswordBody: {
					userID: user._id,
					password: form.password,
					confirmPassword: form.confirmPassword,
				},
			});
			props.dispatch(decrementLoading());
			setForm(defaultUpdateUserPasswordForm);
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
			toggle={closeHelper}
		>
			<ModalHeader toggle={closeHelper}>Update User Password</ModalHeader>

			<ModalBody>
				<div className="mb-3">
					<Label>
						New Password*
					</Label>
					<Input value={form.password} placeholder="Password" onChange={createOnChange("password")}/>
				</div>

				<div className="mb-3">
					<Label>
						Confirm New Password*
					</Label>
					<Input value={form.confirmPassword} placeholder="Confirm Password" onChange={createOnChange("confirmPassword")}/>
				</div>

			</ModalBody>

			<ModalFooter>
				<Button color="primary" onClick={submitUpdateUserPassword}>
					Update Password
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
})(UpdateUserPasswordModal)
