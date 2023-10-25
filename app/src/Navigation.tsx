import React from "react";
import "react-native-gesture-handler";
import {createStackNavigator} from "@react-navigation/stack";
import {NavigationContainer} from "@react-navigation/native";
import AuthNavigator from "./navigators/AuthNavigator";
import MainTabNavigator from "./navigators/MainTabNavigator";
import {connect} from "react-redux";
import {IStore} from "./redux/defaultStore";
import {StatusBar} from "react-native";
import {APIError} from "client";
import SubscriptionModal from "./components/SubscriptionModal";
import ErrorOverlay from "./components/ErrorOverlay";
import LoadingOverlay from "./components/LoadingOverlay";

declare const global: { HermesInternal: null | {} };

const RootStack = createStackNavigator();

interface IProps {
	token?: string,
	loadingCount?: number,
	errors?: APIError[],
}

const Navigation: React.FC<IProps> = (props) => {

	const darkContent = (props.loadingCount && props.loadingCount > 0) || (props.errors && props.errors.length > 0);

	const navigationRef = React.createRef<any>();

	return (
		<React.Fragment>
			<StatusBar
				barStyle={darkContent ? "light-content" : "dark-content"}
			/>
			<NavigationContainer ref={navigationRef}>
				<RootStack.Navigator headerMode="none" initialRouteName={props.token ? "Main" : "Auth"}>
					<RootStack.Screen
						name="Auth"
						component={AuthNavigator}
						options={{
							// When logging out, a pop animation feels intuitive
							// You can remove this if you want the default 'push' animation
							// replace true with a real variable. For some reason the docs use "isSignOut" instead of checking the token, which they keep separately
							animationTypeForReplace: true ? "pop" : "push",
						}}
					/>
					<RootStack.Screen
						name="Main"
						component={MainTabNavigator}
					/>
				</RootStack.Navigator>

			</NavigationContainer>
			<SubscriptionModal navigation={navigationRef}/>
			<ErrorOverlay/>
			<LoadingOverlay/>
		</React.Fragment>
	)
}


export default connect((store: IStore) => {
	return {
		errors: store.metaStore.errors,
		loadingCount: store.metaStore.loadingCount,
		token: store.metaStore.token,
	}
})(Navigation);

