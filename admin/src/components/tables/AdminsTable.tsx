import React, {ReactNode, useState} from "react";
import BootstrapTable from "react-bootstrap-table-next";
import {Button} from "reactstrap";
import UpdateAdminPasswordModal from "../modals/UpdateAdminPasswordModal";
import EnableAdminModal from "../modals/EnableAdminModal";
import DisableAdminModal from "../modals/DisableAdminModal";
import {Admin} from "client";

interface IProps {
	data: Array<Admin>;
	onDoneAction(): void;
}

const AdminsTable: React.FC<IProps> = (props: IProps) => {

	const {data} = props;

	function makeAdminButtons(cell: string, row: Admin): ReactNode {
		return (<AdminButtons admin={row} onDone={props.onDoneAction}/>);
	}

	return (
		<BootstrapTable
			bootstrap4={true}
			striped={false}
			hover={true}
			condensed={true}
			bordered={true}
			wrapperClasses="table-responsive"
			rowStyle={{whiteSpace: "nowrap"}}
			noDataIndication={data === undefined ? "Loading..." : "No Admins"}
			defaultSorted={[{dataField: "email", order: "asc"}]}
			data={data ? data : []}
			keyField="_id"
			columns={[
				{
					dataField: "email",
					text: "Email",
					sort: true,
				},
				{
					dataField: "username",
					text: "Username",
					sort: true,
				},
				{
					dataField: "adminRole",
					text: "Admin Role",
					sort: true,
				},
				{
					dataField: "firstName",
					text: "First Name",
					sort: true,
				},
				{
					dataField: "lastName",
					text: "Last Name",
					sort: true,
				},
				{
					dataField: "active",
					text: "Enabled",
					sort: true,
					classes: (c) => c ? "text-success" : "text-danger",
				},
				{
					dataField: "actions",
					text: "Manage Tools",
					formatter: makeAdminButtons,
				},
			]}
		/>
	);
};

interface IAdminButtonsProps {
	admin: Admin;
	onDone(): void;
}

const AdminButtons: React.FC<IAdminButtonsProps> = (props: IAdminButtonsProps) => {

	const [passwordOpen, setPasswordOpen] = useState(false);
	const [enabledOpen, setEnabledOpen] = useState(false);
	const [disabledOpen, setDisabledOpen] = useState(false);

	function togglePasswordOpen(): void {
		setPasswordOpen(!passwordOpen);
	}

	function toggleEnabledOpen(): void {
		setEnabledOpen(!enabledOpen);
	}

	function toggleDisabledOpen(): void {
		setDisabledOpen(!disabledOpen);
	}

	function done(): void {
		setPasswordOpen(false);
		setEnabledOpen(false);
		setDisabledOpen(false);
		props.onDone();
	}

	return (
		<React.Fragment>
			<UpdateAdminPasswordModal isOpen={passwordOpen} admin={props.admin} onClose={togglePasswordOpen} onDone={done}/>
			<DisableAdminModal isOpen={disabledOpen} admin={props.admin} onClose={toggleDisabledOpen} onDone={done}/>
			<EnableAdminModal isOpen={enabledOpen} admin={props.admin} onClose={toggleEnabledOpen} onDone={done}/>

			<div className="d-flex">
				<Button color="primary" onClick={togglePasswordOpen} className="mr-3">
					Update Password
				</Button>

				{props.admin.active ? (
					<Button color="danger" onClick={toggleDisabledOpen} className="mr-3">
						Disable Admin
					</Button>
				) : (
					<Button color="success" onClick={toggleEnabledOpen} className="mr-3">
						Enable Admin
					</Button>
				)}

			</div>
		</React.Fragment>
	);
};

export default AdminsTable;
