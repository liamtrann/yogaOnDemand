import React, {useRef, useState} from "react";
import SafeAreaView from "react-native-safe-area-view";
import {Image, ImageBackground, ScrollView, StyleSheet, View} from "react-native";
import globalStyles from "../../theme/globalStyles";
import YogaLabel from "../../components/inputs/YogaLabel";
import YogaTextInput from "../../components/inputs/YogaTextInput";
import YogaButton from "../../components/YogaButton";
import Line from "../../components/Line";
import TextButton from "../../components/TextButton";
import {StackNavigationProp} from "@react-navigation/stack";
import {CommonActions} from "@react-navigation/native";
import {UserApi} from "client";
import getConfig from "../../utils/getConfig";
import {addError, decrementLoading, incrementLoading, login as loginAction} from "../../redux/meta/MetaActions";
import { connect } from "react-redux";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import getBackendURL from "../../utils/getBackendURL";
import {createOpenURLOnClick} from "../../utils/openURL";

const logo = require("../../../assets/logos/logo.png");
const bg = require("../../../assets/backgrounds/rocks2.jpg");

interface IProps {
	navigation: StackNavigationProp<any>;
	dispatch: any;
}

const Login: React.FC<IProps> = (props) => {

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const passwordRef = useRef<any>();

	function onSubmitEmailField(): void {
		passwordRef.current.focus();
	}

	async function login(): Promise<void> {


		props.dispatch(incrementLoading());
		try {
			const {token} = await new UserApi(getConfig()).userLogin({
				loginBody: {
					email,
					password,
				}
			})

			props.dispatch(loginAction(token))

			props.navigation.dispatch(CommonActions.reset(
				{
					index: 0,
					routes: [{name: "Main"}],
				}));
		} catch (err) {
			props.dispatch(addError(err));
		}
		props.dispatch(decrementLoading());
	}

	function goToPasswordRecovery(): void {
		props.navigation.push("RecoverPassword1");
	}

	function goToSignUp(): void {
		props.navigation.push("SignUp1");
	}

	const privacyPolicyURL = getBackendURL() + "/utils/privacy_policy";
	const tocURL = getBackendURL() + "/utils/terms_and_conditions";

	return (
		<SafeAreaView style={globalStyles.safeArea}>
			<ImageBackground
				source={bg}
				style={globalStyles.imageBackgroundView}
				imageStyle={[globalStyles.backgroundImage, {
					resizeMode: "cover",
					transform: [{ scale: 1.15 }],
				}]}
			>
				<KeyboardAwareScrollView
					keyboardShouldPersistTaps="handled"
					style={globalStyles.pagePadding}
				>

					<View style={styles.logoContainer}>
						<Image style={styles.logo} source={logo}/>
					</View>

					<YogaLabel>Email Address</YogaLabel>
					<YogaTextInput
						style={styles.emailContainer}
						placeholder="Email Address..."
						onChangeText={setEmail}
						value={email}
						keyboardType="email-address"
						returnKeyType="next"
						blurOnSubmit={false}
						onSubmitEditing={onSubmitEmailField}
						textContentType="username"
						autoCompleteType="email"
						autoCapitalize="none"
					/>

					<YogaLabel>Password</YogaLabel>
					<YogaTextInput
						forwardRef={passwordRef}
						placeholder="Password..."
						onChangeText={setPassword}
						value={password}
						secureTextEntry={true}
						keyboardType="default"
						enablesReturnKeyAutomatically={true}
						onSubmitEditing={login}
						textContentType="password"
						autoCompleteType="password"
						autoCapitalize="none"
					/>

					<View style={styles.buttonContainer}>
						<YogaButton text="Log In" theme="primary" style={styles.individualButtonSpacing} onPress={login}/>
						<YogaButton text="Recover Password" theme="secondary" onPress={goToPasswordRecovery}/>
					</View>

					<Line/>

					<View style={styles.buttonContainer}>
						<YogaButton text="Sign Up for a Free Trial" theme="primary" style={styles.individualButtonSpacing} onPress={goToSignUp}/>
						<TextButton text="Terms and Conditions" onPress={createOpenURLOnClick(tocURL)}/>
						<View style={globalStyles.verticalSpacingSmall}/>
						<TextButton text="Privacy Policy" onPress={createOpenURLOnClick(privacyPolicyURL)}/>
					</View>
				</KeyboardAwareScrollView>
			</ImageBackground>
		</SafeAreaView>
	)
};

const styles = StyleSheet.create({
	logoContainer: {
		marginVertical: 40,
		alignItems: "center",
		width: "100%",
	},
	logo: {
		resizeMode: "contain",
		height: 200,
		width: 200,
	},
	emailContainer: {
		marginBottom: 20,
	},
	buttonContainer: {
		marginVertical: 25,
		alignItems: "center",
	},
	individualButtonSpacing: {
		marginBottom: 15,
	},
});

export default connect()(Login);
