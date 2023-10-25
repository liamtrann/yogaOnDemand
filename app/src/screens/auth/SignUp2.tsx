import React, {useRef, useState} from "react";
import {SafeAreaView, ScrollView, StyleSheet, View} from "react-native";
import YogaText from "../../components/YogaText";
import YogaLabel from "../../components/inputs/YogaLabel";
import YogaDropdown from "../../components/inputs/YogaDropdown";
import globalStyles from "../../theme/globalStyles";
import colours from "../../theme/colours";
import YogaTextInput from "../../components/inputs/YogaTextInput";
import YogaButton from "../../components/YogaButton";
import YogaHeader from "../../components/YogaHeader";
import SignUpBackground from "../../components/pageBackgroundHelpers/SignUpBackground";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";

const SignUp2: React.FC = () => {

	const [paymentType, setPaymentType] = useState();
	const [cardHolderName, setCardHolderName] = useState("");
	const [cardNumber, setCardNumber] = useState("");
	const [expiryDate, setExpiryDate] = useState("");
	const [cvv, setCvv] = useState("");

	const cardNumberRef = useRef<any>();
	const expiryDateRef = useRef<any>();
	const cvvRef = useRef<any>();

	function onSubmitNameField(): void {
		cardNumberRef.current.focus();
	}

	function onSubmitNumberField(): void {
		expiryDateRef.current.focus();
	}

	function onSubmitDateField(): void {
		cvvRef.current.focus();
	}

	async function makeAccount(): Promise<void> {

	}

	return (
		<SafeAreaView style={globalStyles.safeArea}>
			<SignUpBackground>
				<KeyboardAwareScrollView
					keyboardShouldPersistTaps="handled"
					style={globalStyles.pagePadding}
				>

					<YogaHeader title="Activate Free Trial."/>

					<YogaText style={styles.inputDivider}>
						Sign up for a 7 day free trial.
						<YogaText style={{color: colours.black}}>
							{" "}You will not be billed until the end of the free period.
						</YogaText>
					</YogaText>

					<YogaLabel>Payment Type</YogaLabel>
					<YogaDropdown
						placeholder="Select Payment Type..."
						items={[{value: 0, display: "Visa"}]}
						onChange={setPaymentType}
						value={paymentType}
						style={styles.inputDivider}
					/>

					<YogaLabel>Credit Card Information</YogaLabel>
					<YogaTextInput
						placeholder="Cardholder Name..."
						onChangeText={setCardHolderName}
						value={cardHolderName}
						style={styles.creditCardFieldDivider}
						returnKeyType="next"
						blurOnSubmit={false}
						onSubmitEditing={onSubmitNameField}
					/>

					<YogaTextInput
						forwardRef={cardNumberRef}
						placeholder="Card Number..."
						onChangeText={setCardNumber}
						value={cardNumber}
						style={styles.creditCardFieldDivider}
						keyboardType="number-pad"
						returnKeyType="next"
						blurOnSubmit={false}
						onSubmitEditing={onSubmitNumberField}
					/>

					<YogaTextInput
						forwardRef={expiryDateRef}
						placeholder="Expiry Date (MM/YY)..."
						onChangeText={setExpiryDate}
						value={expiryDate}
						style={styles.creditCardFieldDivider}
						keyboardType="number-pad"
						returnKeyType="next"
						blurOnSubmit={false}
						onSubmitEditing={onSubmitDateField}
					/>

					<YogaTextInput
						forwardRef={cvvRef}
						placeholder="CVV..."
						onChangeText={setCvv}
						value={cvv}
						keyboardType="number-pad"
						returnKeyType="next"
						blurOnSubmit={false}
						onSubmitEditing={makeAccount}
					/>

					<View style={styles.buttonContainer}>
						<YogaButton text="Make Account" theme="primary" onPress={makeAccount}/>
					</View>

				</KeyboardAwareScrollView>
			</SignUpBackground>
		</SafeAreaView>
	)
};

const styles = StyleSheet.create({
	inputDivider: {
		marginBottom: 20,
	},
	creditCardFieldDivider: {
		marginBottom: 10,
	},
	buttonContainer: {
		marginTop: 30,
		alignItems: "flex-end",
	},
});

export default SignUp2;
