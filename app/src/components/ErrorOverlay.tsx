import React from "react";
import {Text, ListRenderItemInfo, View, TouchableOpacity, StyleSheet, Dimensions} from "react-native";
import {connect} from "react-redux";
import {APIError} from "client";
import {Linking} from 'react-native'
import YogaButton from "../../../app/src/components/YogaButton";
import {styles as modalStyles} from "./YogaPopup";
import {IStore} from "../redux/defaultStore";
import YogaText from "./YogaText";
import {removeAllErrors} from "../redux/meta/MetaActions";
import textStyles from "../theme/textStyles";
import { uniq, flatten } from "lodash";

interface IProps {
	errors?: APIError[];
	dispatch?: any;
}

const ErrorOverlay: React.FC<IProps> = (props) => {

	if (props.errors === undefined || props.errors.length < 1) {
		return null
	}

	function renderItem(item: APIError, i: number) {

		function createText(text: string, k: number) {
			return <YogaText key={i + "-" + k} style={{paddingHorizontal: 10}}>{text}</YogaText>
		}

		return (
			<React.Fragment key={`parent-${i}`}>
				{item.messages.map(createText)}
			</React.Fragment>
		)
	}

	function dismiss() {
		props.dispatch(removeAllErrors());
	}

	const errors = uniq(flatten(props.errors));

	return (
		<View style={styles.container}>
			<View style={[modalStyles.modalParent, styles.modalParent]}>
				<YogaText style={textStyles.popupHeader}>
					Error!
				</YogaText>
				<View style={modalStyles.body}>
					{errors.map(renderItem)}
				</View>
				<View style={modalStyles.buttonView}>
					<YogaButton text="Dismiss" onPress={dismiss}/>
				</View>
			</View>
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
		paddingHorizontal: 20,
	},
	modalParent: {
		paddingTop: 35,
	}
});

export default connect((store: IStore, props: IProps) => {
	return {
		errors: store.metaStore.errors,
		...props,
	}
})(ErrorOverlay);