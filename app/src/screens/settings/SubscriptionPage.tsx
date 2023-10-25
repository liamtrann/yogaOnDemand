import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import {IStore} from "../../redux/defaultStore";
import {ActivityIndicator, Linking, Platform, SafeAreaView, StyleSheet, View} from "react-native";
import globalStyles from "../../theme/globalStyles";
import YogaHeader from "../../components/YogaHeader";
import YogaText from "../../components/YogaText";
import textStyles from "../../theme/textStyles";
import SubscriptionListItem from "../../components/SubscriptionListItem";
import {Subscription, SubscriptionPurchase} from "react-native-iap";
import {
	getCurrentSubscription,
	getSubscriptionPrice,
	monthlySubscriptionSKU, redeemPurchases,
	subscriptionPurchase, typeOfAccount,
	yearlySubscriptionSKU
} from "../../utils/iapUtils";
import {addError, decrementLoading, incrementLoading} from "../../redux/meta/MetaActions";
import {isNil} from "lodash";
import YogaButton from "../../components/YogaButton";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import YogaTextButton from "../../components/YogaTextButton";
import {createOpenURLOnClick} from "../../utils/openURL";
import getBackendURL from "../../utils/getBackendURL";

interface IProps {
	token?: string;
	dispatch?: any;
}

const SubscriptionPage: React.FC<IProps> = (props) => {

	const [[monthlySubscription, yearlySubscription], setSubscriptions] = useState<[Subscription | undefined, Subscription | undefined]>([undefined, undefined]);
	const [currentSubscription, setCurrentSubscription] = useState<SubscriptionPurchase | undefined>()

	useEffect(() => {
		getSubscriptionPrice()
			.then(setSubscriptions)
			.catch((err) => {
				props.dispatch(addError({messages: ["There was an error getting the subscription information."]}));
			})
		checkCurrentSubscription(true).then().catch()
	}, [])

	async function redeemPurchasesButton() {
		props.dispatch(incrementLoading());
		try {
			const subscription = await redeemPurchases(props.token as string);
			if (subscription) {
				setCurrentSubscription(subscription);
			} else {
				props.dispatch(addError({messages: ["No valid purchases were found."]}));
			}
		} catch (err) {
			props.dispatch(addError(err));
		}
		props.dispatch(decrementLoading());
	}

	function createSubscribeFunction(sku: string) {
		return async () => {
			props.dispatch(incrementLoading());
			try {
				const err = await subscriptionPurchase(props.token as string, sku)
				if (err) {
					props.dispatch(addError(err));
				} else {
					await checkCurrentSubscription(false);
				}
			} catch (err) {
				props.dispatch(addError({messages: ["There was an unexpected error in making the transaction"]}))
			}
			props.dispatch(decrementLoading());
		}
	}

	async function checkCurrentSubscription(showLoading: boolean) {
		if (showLoading) {
			props.dispatch(incrementLoading());
		}
		try {
			const subscription = await getCurrentSubscription(props.token as string);
			if (subscription) {
				setCurrentSubscription(subscription);
			}
		} catch (err) {
			console.error("err", err);
			props.dispatch(addError({messages: ["There was an error checking for the current subscription."]}));
		}
		if (showLoading) {
			props.dispatch(decrementLoading());
		}
	}

	async function visitSubscriptionPage() {
		props.dispatch(incrementLoading());
		const url = Platform.select({
			ios: "https://apps.apple.com/account/subscriptions",
			android: `https://play.google.com/store/account/subscriptions?package=${currentSubscription?.packageNameAndroid}=${currentSubscription?.productId}`
		})
		await Linking.openURL(url as string);
		props.dispatch(decrementLoading());
	}

	const privacyPolicyURL = getBackendURL() + "/utils/privacy_policy";
	const tocURL = getBackendURL() + "/utils/terms_and_conditions";

	return (
		<SafeAreaView style={globalStyles.safeArea}>
			<KeyboardAwareScrollView keyboardShouldPersistTaps="handled">
				<View style={globalStyles.pagePadding}>
					<YogaHeader title="Subscription" back={true} addLine={true}/>

					<View style={globalStyles.verticalSpacingSmall}/>

					<YogaText style={textStyles.smallHeader}>
						Start a 7-Day Free Trial
					</YogaText>

					<View style={globalStyles.verticalSpacingMedium}/>

					<YogaText>
						Become a member and access hundreds of classes featuring our team of professional instructors, on demand whenever.
					</YogaText>

					<View style={globalStyles.verticalSpacingMedium}/>

					<YogaText>
						Start your <YogaText style={[textStyles.bold, textStyles.dark]}>7-day free trial.</YogaText> You
						will not be billed until the end of the period. Afterwards, subscribe to The Yoga Bar On Demand
						for
						the low price of...
					</YogaText>

					<View style={globalStyles.verticalSpacingMedium}/>

					<View style={styles.subscriptionItems}>
						{
							monthlySubscription ?
								<SubscriptionListItem
									title="Monthly Subscription"
									subtitle="Month to Month"
									largePrice={`${monthlySubscription.localizedPrice}/mo.`}
									smallPrice={`${monthlySubscription.localizedPrice.charAt(0)}${Number(monthlySubscription.price) * 12}/yr`}
									buttonText="Start with a Month"
									onPress={createSubscribeFunction(monthlySubscriptionSKU)}
									disabled={!isNil(currentSubscription)}
								/> : <ActivityIndicator style={styles.activityIndicator}/>
						}

						{
							yearlySubscription ?
								<SubscriptionListItem
									title="Yearly Subscription"
									subtitle="Month to Month"
									largePrice={`${yearlySubscription.localizedPrice.charAt(0)}${(Number(yearlySubscription.price) / 12).toFixed(2)}/mo.`}
									smallPrice={`${yearlySubscription.localizedPrice}/yr`}
									buttonText="Get the Best Value"
									onPress={createSubscribeFunction(yearlySubscriptionSKU)}
									disabled={!isNil(currentSubscription)}
								/> : <ActivityIndicator style={styles.activityIndicator}/>
						}
					</View>

					{
						!isNil(currentSubscription) ?
							<React.Fragment>
								<View style={globalStyles.verticalSpacingMedium}/>
								<View style={styles.subscriptionCurrentView}>
									<YogaText style={[textStyles.minorHeader, textStyles.red]}>
										You currently have a subscription, please visit the manage subscriptions page in the
										app store to cancel your subscription, before subscribing again. If your subscription
										was made on another phone, then you may need to redeem your previous purchases below
										to attach them to your Yoga Bar On Demand account.
									</YogaText>
									<View style={globalStyles.verticalSpacingMedium}/>

									<YogaButton text="Visit Subscription Page" onPress={visitSubscriptionPage}/>
								</View>
							</React.Fragment>
							:
							null
					}
					<View style={globalStyles.verticalSpacingMedium}/>
					<YogaText>
						If you have already made a subscription on another phone, then you can redeem your purchases if your phone is logged into the same '{typeOfAccount}' as before.
					</YogaText>
					<View style={globalStyles.verticalSpacingMedium}/>
					<View style={styles.redeemPurchasesView}>
						<YogaButton text="Redeem Previous Purchases" theme="primary" onPress={redeemPurchasesButton}/>
					</View>
				</View>

				<View style={styles.linkButtonsContainer}>
					<View style={globalStyles.verticalSpacing}/>

					<YogaTextButton onPress={createOpenURLOnClick(tocURL)}>Terms and Conditions</YogaTextButton>
					<View style={globalStyles.verticalSpacingMedium}/>

					<YogaTextButton onPress={createOpenURLOnClick(privacyPolicyURL)}>Privacy Policy</YogaTextButton>
					<View style={globalStyles.verticalSpacingMedium}/>
				</View>
			</KeyboardAwareScrollView>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	subscriptionItems: {
		display: "flex",
		justifyContent: "space-between",
		flexDirection: "row"
	},
	activityIndicator: {
		width: 120,
		paddingTop: 50
	},
	subscriptionCurrentView: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
	},
	redeemPurchasesView: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		width: "100%",
	},
	linkButtonsContainer: {
		alignItems: "center",
	},
});

export default connect((store: IStore) => {
	return {
		token: store.metaStore.token
	}
})(SubscriptionPage)
