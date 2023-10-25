import React from "react";
import {connect} from "react-redux";
import {IStore} from "../redux/defaultStore";
import {Spinner} from "reactstrap";

interface IProps {
	loadingIncrement?: number;
	loadingText?: string;
}

const LoadingManager: React.FC<IProps> = (props: IProps) => {

	if (!props.loadingIncrement || props.loadingIncrement < 1) {
		return null;
	}

	return (
		<div
			className="d-flex justify-content-center align-items-center flex-column"
			style={{
				width: "100vw",
				height: "100vh",
				position: "fixed",
				zIndex: 10000,
				backgroundColor: "rgba(0, 0, 0, 0.4)",
			}}
		>
			<Spinner color="light"/>
			<br/>
			<p className="text-light">{props.loadingText}</p>
		</div>
	);
};

export default connect((store: IStore, props: IProps) => {
	return {
		...props,
		loadingIncrement: store.metaStore.loadingIncrement,
		loadingText: store.metaStore.loadingText,
	}
})(LoadingManager);
