import {MetaAction} from "./MetaReducer";
import {IAction} from "../IAction";
import {APIError} from "client";

export function login(token: string): IAction<MetaAction.LOGIN, string> {
	return {
		type: MetaAction.LOGIN,
		payload: token,
	}
}

export function logout(): IAction<MetaAction.LOGOUT> {
	return {
		type: MetaAction.LOGOUT,
	}
}

export function incrementLoading(): IAction<MetaAction.LOADING, number> {
	return {
		type: MetaAction.LOADING,
		payload: 1,
	}
}

export function decrementLoading(): IAction<MetaAction.LOADING, number> {
	return {
		type: MetaAction.LOADING,
		payload: -1,
	}
}

export function setLoadingText(text: string): IAction<MetaAction.LOADING_TEXT, string> {
	return {
		type: MetaAction.LOADING_TEXT,
		payload: text,
	}
}

const makeDefaultError: () => APIError = () => ({messages: ["An unknown error has occurred. Please contact support or try your request again."]});
export async function addError(error?: {json: () => Promise<APIError>} | APIError): Promise<IAction<MetaAction.ADD_ERROR, any>> {
	let _error;

	try {
		if (error === null || error === undefined) {
			_error = makeDefaultError();
		} else if (error.hasOwnProperty("messages") && Array.isArray((error as APIError).messages) && (error as APIError).messages.length > 0) {
			_error = error;
		} else {
			try {
				_error = await (error as {json: () => Promise<APIError>}).json();
			} catch (e) {
				_error = makeDefaultError();
			}
		}
	} catch (e) {
		_error = makeDefaultError();
	}

	return {
		type: MetaAction.ADD_ERROR,
		payload: _error,
	}
}

export function removeError(i: number = 0): IAction<MetaAction.REMOVE_ERROR, number> {
	return {
		type: MetaAction.REMOVE_ERROR,
		payload: i,
	}
}

export function toggleSideBar(open: boolean): IAction<MetaAction.SIDEBAR, boolean> {
	return {
		type: MetaAction.SIDEBAR,
		payload: open,
	}
}
