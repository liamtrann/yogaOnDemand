import React, {ChangeEventHandler, useState} from "react";
import {connect} from "react-redux";
import {IStore} from "../../redux/defaultStore";
import {Button, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import SelectOptionsFactory from "../SelectOptionsFactory";
import {addError, decrementLoading, incrementLoading} from "../../redux/meta/MetaActions";
import {AdminApi, AdminRole, CreateAdminBody} from "client";
import getConfig from "../../utils/getConfig";

interface IProps {
	token?: string;
	dispatch?: any;
	isOpen: boolean;
	onClose(getNewData: boolean): void;
}

const defaultAddAdminForm: CreateAdminBody = {
	username: "",
	password: "",
	confirmPassword: "",
	firstName: "",
	lastName: "",
	email: "",
	adminRole: "" as AdminRole,
};

const AddAdminModal: React.FC<IProps> = (props: IProps) => {

	const {token, isOpen} = props;
	const [form, setForm] = useState<CreateAdminBody>(defaultAddAdminForm);

	function closeHelper(): void {
		setForm(defaultAddAdminForm);
		props.onClose(false);
	}

	function createOnChange(key: keyof CreateAdminBody): ChangeEventHandler<HTMLInputElement> {
		return (e) => {
			setForm({
				...form,
				[key]: e.target.value,
			});
		}
	}

	async function submitAddNewAdmin(): Promise<void> {
		props.dispatch(incrementLoading());

		try {
			await new AdminApi(getConfig(token)).create({createAdminBody: form});
			props.dispatch(decrementLoading());
			setForm(defaultAddAdminForm);
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
			<ModalHeader toggle={closeHelper}>Add New Admin</ModalHeader>

			<ModalBody>
				<div className="mb-3">
					<Label>
						Username*
					</Label>
					<Input value={form.username} placeholder="Username" onChange={createOnChange("username")}/>
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

				<div className="mb-3">
					<Label>
						Admin Role
					</Label>
					<Input type="select" value={form.adminRole} placeholder="Admin Role" onChange={createOnChange("adminRole")}>
						<option value="" selected disabled>Select Admin Role</option>
						<hr/>
						<SelectOptionsFactory strings={Object.values(AdminRole)}/>
					</Input>
				</div>

				<div className="mb-3">
					<Label>
						First Name
					</Label>
					<Input value={form.firstName} placeholder="First Name" onChange={createOnChange("firstName")}/>
				</div>

				<div className="mb-3">
					<Label>
						Last Name
					</Label>
					<Input value={form.lastName} placeholder="Last Name" onChange={createOnChange("lastName")}/>
				</div>

				<div className="mb-3">
					<Label>
						Email
					</Label>
					<Input value={form.email} placeholder="Email" onChange={createOnChange("email")}/>
				</div>
			</ModalBody>

			<ModalFooter>
				<Button color="primary" onClick={submitAddNewAdmin}>
					Add Admin
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
})(AddAdminModal);
