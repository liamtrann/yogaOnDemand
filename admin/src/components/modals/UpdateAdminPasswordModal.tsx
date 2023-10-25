import React, {ChangeEventHandler, useState} from "react";
import {connect} from "react-redux";
import {IStore} from "../../redux/defaultStore";
import {Button, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import {addError, decrementLoading, incrementLoading} from "../../redux/meta/MetaActions";
import {Admin, AdminApi, ChangeAdminPasswordBody} from "client";
import getConfig from "../../utils/getConfig";

interface IProps {
	token?: string;
	dispatch?: any;
	isOpen: boolean;
	admin: Admin;
	onClose(): void;
	onDone(): void;
}

const  defaultUpdateAdminPasswordForm: Partial<ChangeAdminPasswordBody> = {
	password: "",
	confirmPassword: "",
};

const UpdateAdminPasswordModal: React.FC<IProps> = (props: IProps) => {

	const {token, isOpen, admin} = props;
	const [form, setForm] = useState<Partial<ChangeAdminPasswordBody>>(defaultUpdateAdminPasswordForm);

	function closeHelper(): void {
		setForm(defaultUpdateAdminPasswordForm);
		props.onClose();
	}

	function createOnChange(key: keyof ChangeAdminPasswordBody): ChangeEventHandler<HTMLInputElement> {
		return (e) => {
			setForm({
				...form,
				[key]: e.target.value,
			});
		}
	}

	async function submitUpdateAdminPassword(): Promise<void> {
		props.dispatch(incrementLoading());

		try {
			await new AdminApi(getConfig(props.token)).changeAdminPassword({
				changeAdminPasswordBody: {
					adminID: admin._id,
					password: form.password,
					confirmPassword: form.confirmPassword,
				},
			});
			props.dispatch(decrementLoading());
			setForm(defaultUpdateAdminPasswordForm);
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
			<ModalHeader toggle={closeHelper}>Update Admin Password</ModalHeader>

			<ModalBody>
				<div className="mb-3">
					<Label>
						New Password*
					</Label>
					<Input type="password" value={form.password} placeholder="Password" onChange={createOnChange("password")}/>
				</div>

				<div className="mb-3">
					<Label>
						Confirm New Password*
					</Label>
					<Input type="password" value={form.confirmPassword} placeholder="Confirm Password" onChange={createOnChange("confirmPassword")}/>
				</div>

			</ModalBody>

			<ModalFooter>
				<Button color="primary" onClick={submitUpdateAdminPassword}>
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
})(UpdateAdminPasswordModal)
