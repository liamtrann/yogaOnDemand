import React, {useRef, useState} from "react";
import {SafeAreaView, ScrollView, StyleSheet, View} from "react-native";
import YogaText from "../../components/YogaText";
import globalStyles from "../../theme/globalStyles";
import YogaHeader from "../../components/YogaHeader";
import YogaLabel from "../../components/inputs/YogaLabel";
import YogaTextInput from "../../components/inputs/YogaTextInput";
import YogaButton from "../../components/YogaButton";
import RecoverPasswordBackground from "../../components/pageBackgroundHelpers/RecoverPasswordBackground";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";

const RecoverPassword2: React.FC = () => {

	const [code, setCode] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const passwordRef = useRef<any>();
	const confirmPasswordRef = useRef<any>();

	function onSubmitCodeField(): void {
		passwordRef.current.focus();
	}

	function onSubmitPasswordField(): void {
		confirmPasswordRef.current.focus();
	}

	async function submitResetPasswordRequest(): Promise<void> {

	}

	async function resendCode(): Promise<void> {
		alert("todo!");
	}

	return (
		<SafeAreaView style={globalStyles.safeArea}>
			<RecoverPasswordBackground>
				<KeyboardAwareScrollView
					keyboardShouldPersistTaps="handled"
					style={globalStyles.pagePadding}
				>

					<YogaHeader title="Reset Password"/>

					<YogaText style={styles.inputDivider}>
						Enter the confirmation code, then reset your password.
					</YogaText>

					<View style={styles.codeLabelContainer}>
						<YogaLabel style={{marginBottom: -3}}>Confirmation Code</YogaLabel>
						<YogaButton text="Resend Code" buttonStyle={{paddingVertical: 4, width: 160, marginBottom: 2}} textStyle={{fontSize: 13, marginTop: -3}} onPress={resendCode}/>
					</View>
					<YogaTextInput
						style={styles.inputDivider}
						placeholder="Confirmation Code..."
						onChangeText={setCode}
						value={code}
						keyboardType="number-pad"
						returnKeyType="next"
						blurOnSubmit={false}
						onSubmitEditing={onSubmitCodeField}
					/>

					<YogaLabel>New Password</YogaLabel>
					<YogaTextInput
						style={styles.inputDivider}
						forwardRef={passwordRef}
						placeholder="Set Password..."
						onChangeText={setPassword}
						value={password}
						secureTextEntry={true}
						keyboardType="default"
						returnKeyType="next"
						onSubmitEditing={onSubmitPasswordField}
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
						onSubmitEditing={submitResetPasswordRequest}
					/>

					<View style={styles.buttonContainer}>
						<YogaButton text="Set New Password" theme="primary" onPress={submitResetPasswordRequest}/>
					</View>

				</KeyboardAwareScrollView>
			</RecoverPasswordBackground>
		</SafeAreaView>
	)
};

const styles = StyleSheet.create({
	inputDivider: {
		marginBottom: 20,
	},
	codeLabelContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-end",
		marginBottom: 12,
	},
	buttonContainer: {
		marginTop: 30,
		alignItems: "flex-end",
	},
});

export default RecoverPassword2;
