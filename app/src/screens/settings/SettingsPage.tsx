import React from "react";
import SafeAreaView from "react-native-safe-area-view";
import globalStyles from "../../theme/globalStyles";
import {Linking, ScrollView, View} from "react-native";
import YogaHeader from "../../components/YogaHeader";
import YogaTextButton from "../../components/YogaTextButton";
import {connect} from "react-redux";
import {addError, decrementLoading, incrementLoading, logout} from "../../redux/meta/MetaActions";
import {StackNavigationProp} from "@react-navigation/stack";
import getBackendURL from "../../utils/getBackendURL";

interface IProps {
	dispatch: any;
	navigation: StackNavigationProp<any>;
}

const SettingsPage: React.FC<IProps> = (props) => {

	async function logOut() {
		props.dispatch(incrementLoading());
		props.dispatch(logout());
		// takes a while, and to avoid double clicking
		await setTimeout(() => {}, 3000);
		props.dispatch(decrementLoading());
	}

	function createOpenURLOnClick(url: string): () => Promise<void> {
		return async () => {
			props.dispatch(incrementLoading());

			// check if linking is supported
			const supported = Linking.canOpenURL(url);

			// if so open the url
			if (supported) {
				await Linking.openURL(url);
			}

			// if not then display an alert with the URL
			else {
				alert(`Cannot open the url. Please visit '${url}' in your browser`);
			}
			props.dispatch(decrementLoading());
		}
	}

	function navigate(routeName: string): () => void {
		return () => {
			props.navigation.navigate(routeName);
		}
	}

	async function onContactUs(): Promise<void> {
		try {
			await Linking.openURL(`mailto:info@the-yogabar.com?subject=The Yoga Bar on Demand`);
		} catch (e) {
			alert("Could not open email application.");
		}
	}

	const privacyPolicyURL = getBackendURL() + "/utils/privacy_policy";
	const tocURL = getBackendURL() + "/utils/terms_and_conditions";

	return (
		<SafeAreaView style={globalStyles.safeArea}>
			<View style={globalStyles.pagePadding}>
				<YogaHeader title="Settings" back={false} addLine={true}/>
				<View style={globalStyles.verticalSpacingSmall}/>

				<YogaTextButton onPress={navigate("SubscriptionPage")}>Subscription Settings</YogaTextButton>
				<View style={globalStyles.verticalSpacingMedium}/>

				<YogaTextButton onPress={onContactUs}>Contact Us</YogaTextButton>
				<View style={globalStyles.verticalSpacingMedium}/>

				<YogaTextButton onPress={createOpenURLOnClick(tocURL)}>Terms and Conditions</YogaTextButton>
				<View style={globalStyles.verticalSpacingMedium}/>

				<YogaTextButton onPress={createOpenURLOnClick(privacyPolicyURL)}>Privacy Policy</YogaTextButton>
				<View style={globalStyles.verticalSpacingMedium}/>

				<YogaTextButton onPress={logOut}>Log Out</YogaTextButton>
				<View style={globalStyles.verticalSpacingMedium}/>
			</View>
		</SafeAreaView>
	)
};

export default connect()(SettingsPage);
