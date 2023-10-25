import RNIap, {
	ProductPurchase,
	SubscriptionPurchase, InAppPurchase, Subscription, validateReceiptIos
} from 'react-native-iap';
import {EmitterSubscription, Linking, Platform} from "react-native";
import {APIError, UserApi} from "client";
import getConfig from "./getConfig";
import { isNil } from 'lodash';

const iosMonthlySubscription = 'com.theyogabar.theyogabarondemand.monthly.subscription';
const androidMonthlySubscription = 'com.theyogabar.theyogabarondemand.monthly.subscription';
const iosYearlySubscription = 'com.theyogabar.theyogabarondemand.yearly.subscription';
const androidYearlySubscription = 'com.theyogabar.theyogabarondemand.yearly.subscription';

export const monthlySubscriptionSKU = Platform.select({
	ios: iosMonthlySubscription,
	android: androidMonthlySubscription
}) as string;

export const yearlySubscriptionSKU = Platform.select({
	ios: iosYearlySubscription,
	android: androidYearlySubscription
}) as string;

export const typeOfAccount = Platform.select({ios: "Apple Account", android: "Google Play Store Account"})
const storeName = Platform.select({ios: "iTunes/the App Store", android: "Google Play"})

/**
 * Run when you want to purchase the subscription
 */
async function subscriptionPurchase(token: string, sku: string): Promise<void | APIError> {

	// init connection
	try {
		await RNIap.initConnection();
	} catch (err) {
		return {messages: ["There was an error connecting to the store."]}
	}

	// check for a current subscription
	try {
		const subscription = await getCurrentSubscription(token);
		if (!isNil(subscription)) {
			return {messages: [`The ${typeOfAccount} currently logged in already has purchased a subscription, please cancel through the ${storeName} to continue.`]}
		}
	} catch (err) {
		return {messages: ["There was an error checking this accounts transaction history."]}
	}

	// flush out ghost purchases
	try {
		await RNIap.flushFailedPurchasesCachedAsPendingAndroid();
		await RNIap.clearTransactionIOS();
	} catch (err) {
		return {messages: ["There was an error making the purchases due to flushing current ongoing purchases, please stop making any purchase in order to proceed."]}
	}

	// create a promise to start the listener and run the request, but finish the function when the listener is complete
	type Response = [EmitterSubscription, EmitterSubscription, string?];
	const [listener, errorListener, errorReason] = await new Promise(async (resolve: (v: Response) => void, reject: (v: Response) => void) => {

		const errorListener = RNIap.purchaseErrorListener(async (err) => {
			// console.log("err", err);
			if (err.code === "E_USER_CANCELLED") {
				resolve([listener, errorListener, "The transaction was cancelled."]);
				return;
			}
			resolve([listener, errorListener, err.message]);
		})

		// create listener for when the transaction is finished
		const listener = RNIap.purchaseUpdatedListener(async (purchase: SubscriptionPurchase | ProductPurchase) => {
			const receipt = purchase.transactionReceipt;

			if (receipt) {

				// tell the server about the transaction and save to user
				try {
					await new UserApi(getConfig(token)).addIOSReceiptToUser({addIOSReceiptToUserDataRequestBody: {receiptData: receipt}})
				} catch (err) {
					console.error(err);
					await RNIap.flushFailedPurchasesCachedAsPendingAndroid();
					await RNIap.clearTransactionIOS();
					resolve([listener, errorListener, "There was a problem resolving the receipt, the transaction was cancelled."]);
					return;
				}

				// let google or apple know the purchase went through fine. if this doesn't happen on android a refund will be issued
				if (Platform.OS === 'ios') {
					await RNIap.finishTransactionIOS(purchase.transactionId as string);
				} else if (Platform.OS === 'android') {
					await RNIap.acknowledgePurchaseAndroid(purchase.purchaseToken as string);
				}
				await RNIap.finishTransaction(purchase, false);

				resolve([listener, errorListener]);
			} else {
				resolve([listener, errorListener, "There was an error finalizing the transaction. No receipt was generated."]);
			}
		});

		try {
			await RNIap.requestSubscription(sku);
		} catch (err) {
			resolve([listener, errorListener, "There was an error requesting the subscription."]);
		}
	})

	// remove the listener
	try {
		listener.remove();
		errorListener.remove();
	} catch (err) {
		// console.log("err", err);
	}

	// throw error if necessary
	if (errorReason) {
		return {messages: [errorReason]};
	}
}

/**
 * results described here https://www.npmjs.com/package/react-native-iap
 */
// returns [monthly, yearly]
async function getSubscriptionPrice(): Promise<[Subscription, Subscription]> {
	// init connection
	await RNIap.initConnection();

	// get price
	const subscriptions = await RNIap.getSubscriptions([monthlySubscriptionSKU, yearlySubscriptionSKU]);
	return subscriptions as [Subscription, Subscription];
}

/**
 * gets the current subscription if it exists
 */
async function getCurrentSubscription(token: string): Promise<SubscriptionPurchase | void> {
	// init connection
	await RNIap.initConnection();

	const purchases = await RNIap.getAvailablePurchases();
	const promises = purchases.map(async (purchase) => {
		if (purchase.productId === monthlySubscriptionSKU || purchase.productId === yearlySubscriptionSKU) {
			const valid = await isValidReceipt(purchase.transactionReceipt, token);

			if (valid) {
				return purchase
			}
		}
	})
	const results = await Promise.all(promises);
	const resultsFiltered = results.filter(v => !isNil(v));

	if (resultsFiltered.length > 0) {
		return resultsFiltered[0];
	}
}

/**
 * pass in a receipt and it will validate the subscription, and tell if it is still active
 */
async function isValidReceipt(receipt: string, token: string): Promise<boolean> {
	try {
		const {valid} = await new UserApi(getConfig(token)).isValidIOSReceipt({isValidIOSReceiptRequestBody: {receiptData: receipt}})
		return isNil(valid) ? false : valid;
	} catch (err) {
		// console.log("err", err);
		return false;
	}
}

/**
 * will redeem the current subscription for the person logged into the phone and attach it to the account. If a subscription is returned, then
 * it actually found one and updated it. If nothing is returned then it didn't find any subscriptions.
 */
async function redeemPurchases(token: string): Promise<SubscriptionPurchase | void> {
	const currentSubscription = await getCurrentSubscription(token);
	if (currentSubscription) {
		await new UserApi(getConfig(token)).addIOSReceiptToUser({addIOSReceiptToUserDataRequestBody: {receiptData: currentSubscription.transactionReceipt}});
		return currentSubscription;
	}
}

export {subscriptionPurchase, getSubscriptionPrice, getCurrentSubscription, redeemPurchases};
