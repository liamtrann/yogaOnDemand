import React from "react";
import {createStackNavigator} from "@react-navigation/stack";
import Login from "../screens/auth/Login";
import RecoverPassword1 from "../screens/auth/RecoverPassword1";
import RecoverPassword2 from "../screens/auth/RecoverPassword2";
import SignUp1 from "../screens/auth/SignUp1";
import SignUp2 from "../screens/auth/SignUp2";

const AuthStack = createStackNavigator();

const AuthNavigator: React.FC = () => {

	return (
		<AuthStack.Navigator initialRouteName="Login" screenOptions={{headerShown: false}}>
			<AuthStack.Screen name="Login" component={Login}/>

			<AuthStack.Screen name="RecoverPassword1" component={RecoverPassword1}/>
			<AuthStack.Screen name="RecoverPassword2" component={RecoverPassword2}/>

			<AuthStack.Screen name="SignUp1" component={SignUp1}/>
			<AuthStack.Screen name="SignUp2" component={SignUp2}/>

		</AuthStack.Navigator>
	)
};

export default AuthNavigator;
