import { Provider } from "react-redux";
import {store, persistor} from "./redux";
import { PersistGate } from "redux-persist/integration/react";
import React from "react";
import Navigation from "./Navigation";

const App = () => {
	return (
		<Provider store={store}>
			<PersistGate persistor={persistor}>
				<Navigation/>
			</PersistGate>
		</Provider>
	);
};

export default App;