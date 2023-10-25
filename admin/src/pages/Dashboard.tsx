import React, {ReactNode, useEffect, useState} from "react";
import {connect} from "react-redux";
import {IStore} from "../redux/defaultStore";
import {Card, CardBody, CardHeader, Col, Container, Input, Label, Row, Spinner} from "reactstrap";
import {addError, decrementLoading, incrementLoading} from "../redux/meta/MetaActions";
import {Admin, AdminApi} from "client";
import getConfig from "../utils/getConfig";

interface IProps {
	token?: string;
	dispatch?: any;
}

const Dashboard: React.FC<IProps> = (props: IProps) => {

	const [currentAdmin, setCurrentAdmin] = useState<Admin>();

	useEffect(() => {
		getCurrentAdmin().then().catch();
	}, []);

	async function getCurrentAdmin(): Promise<void> {
		// props.dispatch(incrementLoading());
		//
		// try {
		// 	const res = await new AdminApi(getConfig(props.token)).profileGet();
		//
		// 	setCurrentAdmin(res);
		// } catch (e) {
		// 	props.dispatch(addError(e));
		// }
		//
		// props.dispatch(decrementLoading());
	}

	function makeAdminInfoColumn(label: string, value: string): ReactNode {
		return (
			<Col xs={12} md={6} className="mb-3">
				<Label>{label}</Label>
				<Input value={value ? value : "Not Available"} readOnly={true} disabled={true} className={value ? "" : "text-muted"}/>
			</Col>
		)
	}

	if (!currentAdmin) {
		return (
			<div className="vh-100 w-100 d-flex justify-content-center align-items-center">
				<div className="d-flex align-items-center">
					<Spinner className="mr-3"/>
					<h4 className="mb-0">
						Loading...
					</h4>
				</div>
			</div>
		)
	}

	return (
		<Container className="my-5">
			<Card>
				<CardHeader>Dashboard & Admin Info</CardHeader>
				<CardBody>
					<Row>
						{makeAdminInfoColumn("Admin Role", currentAdmin.adminRole)}
						{makeAdminInfoColumn("Username", currentAdmin.username)}
						{makeAdminInfoColumn("First Name", currentAdmin.firstName)}
						{makeAdminInfoColumn("Last Name", currentAdmin.lastName)}
						{makeAdminInfoColumn("Email", currentAdmin.email)}
					</Row>
				</CardBody>
			</Card>
		</Container>
	);
};

export default connect((store: IStore, props: IProps) => {
	return {
		...props,
		token: store.metaStore.token,
	}
})(Dashboard);
