import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import {Provider} from "react-redux";
import {PersistGate} from "redux-persist/integration/react";
import {persistor, store} from "./redux"
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import "./style/index.scss";

ReactDOM.render(
    <Provider store={store}>
         <PersistGate persistor={persistor} loading={null}>
            <App />
        </PersistGate>
    </Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
