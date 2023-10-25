import React, {useEffect} from "react";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import FeaturedNavigator from "./FeaturedNavigator";
import SettingsNavigator from "./SettingsNavigator";
import ProfileNavigator from "./ProfileNavigator";
import ClassesNavigator from "./ClassesNavigator";
import {connect} from "react-redux";
import {IStore} from "../redux/defaultStore";
import {logout} from "../redux/meta/MetaActions";
import getConfig from "../utils/getConfig";
import {UtilsApi} from "client";
import {CommonActions, useNavigation} from "@react-navigation/native";
import TabBar from "../components/TabBar";

const MainTabs = createBottomTabNavigator();

interface IProps {
	token?: string,
	dispatch?: any
}

const tokenCheckInterval: number = 60000;

const MainTabNavigator: React.FC<IProps> = (props) => {

	const navigation = useNavigation();

	useEffect(() => {
		checkToken().then().catch();
		const interval = setInterval(checkToken, tokenCheckInterval);
		return () => clearInterval(interval);
	}, [props.token])

	async function checkToken() {
		// don't need to check if token doesn't exist
		if (!props.token) {
			navigateBack()
			return;
		}

		try {
			const res = await new UtilsApi(getConfig(props.token)).checkTokenExpiration({tokenBody: {token: props.token}});

			if (res.expired) {
				props.dispatch(logout());
				navigateBack();
			}
		} catch (e) {}
	}

	function navigateBack() {
		navigation.dispatch(CommonActions.reset(
			{
				index: 0,
				routes: [{name: "Auth"}],
			})
		);
	}

	return (
		<MainTabs.Navigator
			tabBar={props => <TabBar {...props} />}
			initialRouteName="Featured"
		>
			<MainTabs.Screen name="Featured" component={FeaturedNavigator}/>
			<MainTabs.Screen name="Profile" component={ProfileNavigator}/>
			<MainTabs.Screen name="Classes"  component={ClassesNavigator}/>
			<MainTabs.Screen name="Settings" component={SettingsNavigator}/>
		</MainTabs.Navigator>
	)
};

export default connect((store: IStore) => {
	return {
		token: store.metaStore.token,
	}
})(MainTabNavigator);
