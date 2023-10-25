import React, {useEffect, useRef, useState} from "react";
import {SafeAreaView, ScrollView, StyleSheet, View} from "react-native";
import globalStyles from "../../theme/globalStyles";
import {StackNavigationProp} from "@react-navigation/stack";
import YogaText from "../../components/YogaText";
import YogaLabel from "../../components/inputs/YogaLabel";
import YogaTextInput from "../../components/inputs/YogaTextInput";
import YogaButton from "../../components/YogaButton";
import YogaHeader from "../../components/YogaHeader";
import SignUpBackground from "../../components/pageBackgroundHelpers/SignUpBackground";
import {addError, decrementLoading, incrementLoading, login} from "../../redux/meta/MetaActions";
import {UserApi} from "client";
import {CommonActions} from "@react-navigation/native";
import {getSubscriptionPrice, subscriptionPurchase} from "../../utils/iapUtils";
import {connect} from "react-redux";
import getConfig from "../../utils/getConfig";
import {Subscription} from "react-native-iap";
import {err} from "react-native-svg/lib/typescript/xml";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";

interface IProps {
	navigation: StackNavigationProp<any>;
	dispatch: any;
}

const SignUp1: React.FC<IProps> = (props: IProps) => {

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const passwordRef = useRef<any>();
	const confirmPasswordRef = useRef<any>();

	function onSubmitEmailField(): void {
		passwordRef.current.focus();
	}

	function onSubmitPasswordField(): void {
		confirmPasswordRef.current.focus();
	}

	async function signUp(): Promise<void> {
		props.dispatch(incrementLoading());

		try {
			// sign up
			await new UserApi(getConfig()).signUp({
				signUpBody: {
					email,
					password,
					confirmPassword,
				}
			});

			// login to get token for purchase
			const {token} = await new UserApi(getConfig()).userLogin({
				loginBody: {
					email,
					password,
				}
			})

			props.dispatch(login(token));

			props.navigation.dispatch(CommonActions.reset(
				{
					index: 0,
					routes: [{name: "Main"}],
				}));


		} catch (err) {
			props.dispatch(addError(err));
		}
		props.dispatch(decrementLoading());
		// props.navigation.push("SignUp2");
	}

	return (
		<SafeAreaView style={globalStyles.safeArea}>
			<SignUpBackground>
				<KeyboardAwareScrollView
					keyboardShouldPersistTaps="handled"
					style={globalStyles.pagePadding}
				>

					<YogaHeader title="Welcome."/>

					<YogaText style={styles.inputDivider}>
						Please enter your personal information to make an account.
					</YogaText>

					<YogaLabel>Email Address</YogaLabel>
					<YogaTextInput
						style={styles.inputDivider}
						placeholder="Email Address..."
						onChangeText={setEmail}
						value={email}
						keyboardType="email-address"
						returnKeyType="next"
						blurOnSubmit={false}
						onSubmitEditing={onSubmitEmailField}
						autoCapitalize="none"
					/>

					<YogaLabel>Password</YogaLabel>
					<YogaTextInput
						style={styles.inputDivider}
						forwardRef={passwordRef}
						placeholder="Set Password..."
						onChangeText={setPassword}
						value={password}
						secureTextEntry={true}
						keyboardType="default"
						returnKeyType="next"
						enablesReturnKeyAutomatically={false}
						onSubmitEditing={onSubmitPasswordField}
						autoCapitalize="none"
					/>

					<YogaLabel>Confirm Password</YogaLabel>
					<YogaTextInput
						forwardRef={confirmPasswordRef}
						placeholder="Confirm Password..."
						onChangeText={setConfirmPassword}
						value={confirmPassword}
						secureTextEntry={true}
						keyboardType="default"
						enablesReturnKeyAutomatically={false}
						onSubmitEditing={signUp}
						autoCapitalize="none"
					/>

					<View style={styles.buttonContainer}>
						<YogaButton text="Get Started" theme="primary" onPress={signUp}/>
					</View>

				</KeyboardAwareScrollView>
			</SignUpBackground>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	inputDivider: {
		marginBottom: 20,
	},
	buttonContainer: {
		marginTop: 30,
		alignItems: "flex-end",
	},

})

export default connect()(SignUp1);
