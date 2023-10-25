import React, {useState} from "react";
import {SafeAreaView, ScrollView, StyleSheet, View} from "react-native";
import YogaText from "../../components/YogaText";
import globalStyles from "../../theme/globalStyles";
import {StackNavigationProp} from "@react-navigation/stack";
import YogaHeader from "../../components/YogaHeader";
import YogaLabel from "../../components/inputs/YogaLabel";
import YogaTextInput from "../../components/inputs/YogaTextInput";
import YogaButton from "../../components/YogaButton";
import RecoverPasswordBackground from "../../components/pageBackgroundHelpers/RecoverPasswordBackground";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";

interface IProps {
	navigation: StackNavigationProp<any>;
}

const RecoverPassword1: React.FC<IProps> = (props) => {

	const [email, setEmail] = useState("");

	async function submitEmail(): Promise<void> {
		props.navigation.push("RecoverPassword2");
	}

	return (
		<SafeAreaView style={globalStyles.safeArea}>
			<RecoverPasswordBackground>
				<KeyboardAwareScrollView
					keyboardShouldPersistTaps="handled"
					style={globalStyles.pagePadding}
				>

					<YogaHeader title="Recover Password"/>

					<YogaText style={styles.inputDivider}>
						Please enter your email address to receive a confirmation code.
					</YogaText>

					<YogaLabel>Email Address</YogaLabel>
					<YogaTextInput
						placeholder="Email Address..."
						onChangeText={setEmail}
						value={email}
						keyboardType="email-address"
						onSubmitEditing={submitEmail}
						textContentType="username"
						autoCompleteType="email"
					/>

					<View style={styles.buttonContainer}>
						<YogaButton text="Next" theme="primary" onPress={submitEmail}/>
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
	buttonContainer: {
		marginTop: 30,
		alignItems: "flex-end",
	},
});

export default RecoverPassword1;
