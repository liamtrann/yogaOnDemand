import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import {IStore} from "../redux/defaultStore";
import {Button, Container} from "reactstrap";
import AdminsTable from "../components/tables/AdminsTable";
import AddAdminModal from "../components/modals/AddAdminModal";
import {addError, decrementLoading, incrementLoading} from "../redux/meta/MetaActions";
import {Admin, AdminApi} from "client";
import getConfig from "../utils/getConfig";

interface IProps {
	token?: string;
	dispatch?: any;
}

const ManageAdmins: React.FC<IProps> = (props: IProps) => {

	const {token} = props;
	const [showNewAdminModal, setShowNewAdminModal] = useState(false);
	const [data, setData] = useState<Array<Admin>>();

	useEffect(() => {
		readAdmins().then().catch();
	}, []);

	function toggleNewAdminModal(getNewData: boolean): void {
		setShowNewAdminModal(!showNewAdminModal);
		if (getNewData) {
			readAdmins().then().catch();
		}
	}

	async function readAdmins(): Promise<void> {
		props.dispatch(incrementLoading());

		try {
			const res = await new AdminApi(getConfig(token)).getAdminList();

			setData(res);
		} catch (e) {
			props.dispatch(addError(e));
		}

		props.dispatch(decrementLoading());
	}

	return (
		<React.Fragment>
			<AddAdminModal isOpen={showNewAdminModal} onClose={toggleNewAdminModal}/>

			<div className="px-3">
				<Container className="my-5">
					<div className="mb-5">
						<h1>
							Manage Admins
						</h1>
						<p>
							On this page you can see a list of all the current admins in the system, as well as toggle
							their
							status
							between enabled & disabled, or update their passwords. You can also add a new admin with the
							button below.
						</p>

						<Button color="primary" onClick={() => setShowNewAdminModal(true)}>
							Add New Admin
						</Button>
					</div>

				</Container>

				<AdminsTable data={data} onDoneAction={readAdmins}/>
			</div>
		</React.Fragment>
	);
};

export default connect((store: IStore, props: IProps) => {
	return {
		...props,
		token: store.metaStore.token,
	}
})(ManageAdmins);
