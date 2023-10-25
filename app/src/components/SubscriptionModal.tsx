import React from "react";
import {Dimensions, StyleSheet, View} from "react-native";
import {styles as modalStyles} from "./YogaPopup";
import YogaText from "./YogaText";
import textStyles from "../theme/textStyles";
import YogaButton from "./YogaButton";
import {decrementLoading, incrementLoading, showSubscriptionModal} from "../redux/meta/MetaActions";
import { connect } from "react-redux";
import {IStore} from "../redux/defaultStore";
import globalStyles from "../theme/globalStyles";

interface IProps {
	dispatch?: any;
	showSubscriptionModal?: boolean;
	token?: string;
	navigation?: any;
}

const SubscriptionModal: React.FC<IProps> = (props) => {

	if (!props.showSubscriptionModal) {
		return null
	}

	function viewOptions() {
		props.dispatch(incrementLoading());
		props.dispatch(showSubscriptionModal(false));
		props.navigation.current.navigate("SubscriptionPage");
		props.dispatch(decrementLoading());
	}

	function dismiss() {
		props.dispatch(showSubscriptionModal(false));
	}

	return (
		<View style={styles.container}>
			<View style={[modalStyles.modalParent, styles.modalParent]}>
				<YogaText style={textStyles.popupHeader}>
					Subscribe Today!
				</YogaText>
				<View style={modalStyles.body}>
					<YogaText>
						In order to access the premium content in the `Yoga Bar On Demand`, you must purchase a subscription.
					</YogaText>
				</View>
				<View style={modalStyles.buttonView}>
					<YogaButton text="View Subscriptions Options" onPress={viewOptions}/>
					<View style={globalStyles.verticalSpacingSmall}/>
					<YogaButton theme="secondary" size="small" text="Dismiss" onPress={dismiss}/>
				</View>
			</View>
		</View>
	);
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
	},
	buttonContainer: {
		display: "flex",
		width: "100%",
		justifyContent: "center"
	}
});

export default connect((store: IStore, props: IProps) => {
	return {
		...props,
		token: store.metaStore.token,
		showSubscriptionModal: store.metaStore.showSubscriptionModal,
	}
})(SubscriptionModal);