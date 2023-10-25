import {connect} from "react-redux";
import React from "react";
import {IStore} from "../redux/defaultStore";
import {Redirect, Route, RouteProps} from "react-router";
import {addError} from "../redux/meta/MetaActions";

interface IProps {
	token?: string;
	dispatch?: any;
}

const AuthenticatedRoute: React.FC<RouteProps & IProps> = (props: RouteProps & IProps) => {

	const {component, token, ...rest} = props;
	const Component = component;

	if (!token) {
		props.dispatch(addError({messages: ["You must have a token to access that page. If you were previously logged in, your access token may have expired and you must log in again to get a new one."]}));
		return <Redirect to="/"/>
	}

	return (
		<Route
			{...rest}
			render={props => <Component {...props}/>}
		/>
	)
};

export default connect((store: IStore, props: IProps) => {
	return {
		token: store.metaStore.token,
	}
})(AuthenticatedRoute);
