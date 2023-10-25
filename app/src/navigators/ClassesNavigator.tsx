import React from "react";
import {createStackNavigator} from "@react-navigation/stack";
import ClassesPage from "../screens/classes/ClassesPage";
import VideoPage from "../screens/VideoPage";
import SubscriptionPage from "../screens/settings/SubscriptionPage";

const ClassesStack = createStackNavigator();

const ClassesNavigator: React.FC = () => {

	return (
		<ClassesStack.Navigator>
			<ClassesStack.Screen name="ClassesPage" component={ClassesPage} options={{headerShown: false}}/>
			<ClassesStack.Screen name="VideoPage" component={VideoPage} options={{headerShown: false}}/>
			<ClassesStack.Screen name="SubscriptionPage" component={SubscriptionPage} options={{headerShown: false}}/>
		</ClassesStack.Navigator>
	)
};

export default ClassesNavigator;
