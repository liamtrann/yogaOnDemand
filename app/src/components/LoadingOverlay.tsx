import React from "react";
import {ActivityIndicator, Dimensions, StyleSheet, View} from "react-native";
import colours from "../theme/colours";
import {connect} from "react-redux";
import {IStore} from "../redux/defaultStore";

interface IProps {
	loadingCount?: number;
}

const LoadingOverlay: React.FC<IProps> = ({loadingCount}) => {

	if (loadingCount === undefined || loadingCount < 1) {
		return null
	}

	return (
		<View style={styles.container}>
			<ActivityIndicator size="large" color={colours.white}/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		position: "absolute",
		top: 0,
		bottom: 0,
		backgroundColor: "rgba(0,0,0,0.5)",
		height: Dimensions.get("window").height,
		width: Dimensions.get("window").width,
		justifyContent: "center",
		alignItems: "center",
	}
});

export default connect((store: IStore, props: IProps) => {
	return {
		loadingCount: store.metaStore.loadingCount,
		...props,
	}
})(LoadingOverlay);