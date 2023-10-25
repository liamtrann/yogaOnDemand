import {MetaAction} from "./MetaReducer";
import {IAction} from "../index";
import {APIError} from "client";

export function incrementLoading(): IAction<MetaAction.LOADING, number> {
	return {type: MetaAction.LOADING, payload: 1}
}

export function decrementLoading(): IAction<MetaAction.LOADING, number> {
	return {type: MetaAction.LOADING, payload: -1}
}

export function login(token: string): IAction<MetaAction.LOGIN, string> {
	return {type: MetaAction.LOGIN, payload: token}
}

export function logout(): IAction<MetaAction.LOGOUT> {
	return {type: MetaAction.LOGOUT};
}

const defaultError: () => APIError = () => {return {messages: ["An unexpected error has occurred. Please get in touch with support or try again."]}};
export async function addError(error?: {json: () => Promise<APIError>} | APIError): Promise<IAction<MetaAction.ADD_ERROR | MetaAction.SUBSCRIPTION_MODAL, APIError | boolean>> {

	let _error: APIError;
	console.log(error);


	try {
		if (error === undefined || error === null) {
			_error = defaultError();
		} else if (error.hasOwnProperty("messages") && Array.isArray((error as APIError).messages) && (error as APIError).messages.length > 0) {
			_error = error as APIError;
		} else {
			try {
				_error = await (error as {json: () => Promise<APIError>}).json();
			} catch {
				_error = defaultError();
			}
		}
	} catch {
		_error = defaultError();
	}

	if (_error.hasOwnProperty("requiredSubscriptionError") && _error.requiredSubscriptionError === true) {
		return showSubscriptionModal(true);
	}

	return {type: MetaAction.ADD_ERROR, payload: _error}
}

export function removeError(index: number = 0): IAction<MetaAction.CLEAR_ERROR, number> {
	return {type: MetaAction.CLEAR_ERROR, payload: index}
}

export function removeAllErrors(): IAction<MetaAction.CLEAR_ALL_ERRORS> {
	return {type: MetaAction.CLEAR_ALL_ERRORS}
}

export function showSubscriptionModal(show: boolean): IAction<MetaAction.SUBSCRIPTION_MODAL, boolean> {
	return {type: MetaAction.SUBSCRIPTION_MODAL, payload: show};
}