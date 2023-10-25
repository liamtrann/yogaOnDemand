import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import {IStore} from "../redux/defaultStore";
import {Button, Container} from "reactstrap";
import UsersTable from "../components/tables/UsersTable";
import AddUserModal from "../components/modals/AddUserModal";
import {addError, decrementLoading, incrementLoading} from "../redux/meta/MetaActions";
import {AdminApi, User} from "client";
import getConfig from "../utils/getConfig";

interface IProps {
	token?: string;
	dispatch?: any;
}

const ManageUsers: React.FC<IProps> = (props: IProps) => {

	const {token} = props;
	const [showNewUserModal, setShowNewUserModal] = useState(false);
	const [data, setData] = useState<Array<User>>();

	useEffect(() => {
		readUsers().then().catch();
	}, []);

	function toggleNewUserModal(getNewData: boolean): void {
		setShowNewUserModal(!showNewUserModal);
		if (getNewData) {
			readUsers().then().catch();
		}
	}

	async function readUsers(): Promise<void> {
		props.dispatch(incrementLoading());

		try {
			const res = await new AdminApi(getConfig(token)).getUserList();
			setData(res);
		} catch (e) {
			props.dispatch(addError(e));
		}

		props.dispatch(decrementLoading());
	}

	return (
		<React.Fragment>
			<AddUserModal isOpen={showNewUserModal} onClose={toggleNewUserModal}/>

			<div className="px-3">
				<Container className="my-5">
					<div className="mb-5">
						<h1>
							Manage Users
						</h1>
						<p>
							On this page you can see a list of all the current users on the platform, edit their
							passwords, give/remove subscriptions, and enable/disable them.
						</p>

						<Button color="primary" onClick={() => setShowNewUserModal(true)}>
							Add New User
						</Button>
					</div>

				</Container>

				<UsersTable data={data} onDoneAction={readUsers}/>
			</div>
		</React.Fragment>
	);
};

export default connect((store: IStore, props: IProps) => {
	return {
		...props,
		token: store.metaStore.token,
	}
})(ManageUsers);
