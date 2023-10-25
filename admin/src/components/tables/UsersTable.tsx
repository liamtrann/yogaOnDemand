import React, {ReactNode, useState} from "react";
import BootstrapTable from "react-bootstrap-table-next";
import {Button} from "reactstrap";
import UpdateUserPasswordModal from "../modals/UpdateUserPasswordModal";
import EnableUserModal from "../modals/EnableUserModal";
import DisableUserModal from "../modals/DisableUserModal";
import {User} from "client";
import moment from "moment";
import ApplyFreeSubscriptionModal from "../modals/ApplyFreeSubscriptionModal";

interface IProps {
	data: Array<User>;
	onDoneAction(): void;
}

const UsersTable: React.FC<IProps> = (props: IProps) => {

	const {data} = props;

	function makeUserButtons(cell: string, row: User): ReactNode {
		return (<UserButtons user={row} onDone={props.onDoneAction}/>);
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
			noDataIndication={data === undefined ? "Loading..." : "No Users"}
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
					dataField: "active",
					text: "Enabled",
					sort: true,
					classes: (c) => c ? "text-success" : "text-danger",
				},
				{
					dataField: "freeSubscriptionExpiration",
					text: "Free Subscription",
					sort: true,
					classes: (c) => (typeof c === "number" && Date.now() < c) ? "text-success" : "text-danger",
					formatter: (cell: number) => cell === undefined ? "None" : moment(cell).format("DD/MM/YYYY")
				},
				{
					dataField: "actions",
					text: "Manage Tools",
					formatter: makeUserButtons,
				},
			]}
		/>
	);
};

interface IUserButtonsProps {
	user: User;
	onDone(): void;
}

const UserButtons: React.FC<IUserButtonsProps> = (props: IUserButtonsProps) => {

	const [passwordOpen, setPasswordOpen] = useState(false);
	const [enabledOpen, setEnabledOpen] = useState(false);
	const [disabledOpen, setDisabledOpen] = useState(false);
	const [applyFreeSubscriptionOpen, setApplyFreeSubscriptionOpen] = useState(false);

	function togglePasswordOpen(): void {
		setPasswordOpen(!passwordOpen);
	}

	function toggleApplyFreeSubscription(): void {
		setApplyFreeSubscriptionOpen(!applyFreeSubscriptionOpen);
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
		setApplyFreeSubscriptionOpen(false);
		props.onDone();
	}

	return (
		<React.Fragment>
			<UpdateUserPasswordModal isOpen={passwordOpen} user={props.user} onClose={togglePasswordOpen} onDone={done}/>
			<EnableUserModal isOpen={enabledOpen} user={props.user} onClose={toggleEnabledOpen} onDone={done}/>
			<DisableUserModal isOpen={disabledOpen} user={props.user} onClose={toggleDisabledOpen} onDone={done}/>
			<ApplyFreeSubscriptionModal isOpen={applyFreeSubscriptionOpen} user={props.user} onClose={toggleApplyFreeSubscription} onDone={done}/>

			<div className="d-flex">
				<Button color="primary" onClick={togglePasswordOpen} className="mr-3">
					Update Password
				</Button>

				<Button color="success" onClick={toggleApplyFreeSubscription} className="mr-3">
					Manage Free Subscription
				</Button>

				{props.user.active ? (
					<Button color="danger" onClick={toggleDisabledOpen} className="mr-3">
						Disable User
					</Button>
				) : (
					<Button color="success" onClick={toggleEnabledOpen} className="mr-3">
						Enable User
					</Button>
				)}



			</div>
		</React.Fragment>
	);
};

export default UsersTable;
