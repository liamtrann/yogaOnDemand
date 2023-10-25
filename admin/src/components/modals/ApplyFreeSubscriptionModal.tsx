import React, {ChangeEventHandler, useState} from "react";
import {connect} from "react-redux";
import {IStore} from "../../redux/defaultStore";
import {Button, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import {AdminApi, ChangeUserPasswordBody, User, GiveFreeSubscriptionBody} from "client";
import {addError, decrementLoading, incrementLoading} from "../../redux/meta/MetaActions";
import getConfig from "../../utils/getConfig";
import moment from "moment";

interface IProps {
	token?: string;
	dispatch?: any;
	isOpen: boolean;
	user: User;
	onClose(): void;
	onDone(): void;
}

const ApplyFreeSubscriptionModal: React.FC<IProps> = (props: IProps) => {

	const {token, isOpen, user} = props;
	const [form, setForm] = useState<Partial<GiveFreeSubscriptionBody>>({
		userID: user._id,
		freeSubscriptionExpiration: moment().startOf('day').add("30", "days").valueOf(),
	});

	function closeHelper(): void {
		setForm({
			userID: user._id,
			freeSubscriptionExpiration: moment().startOf('day').add("30", "days").valueOf(),
		});
		props.onClose();
	}

	function createOnChange(key: keyof GiveFreeSubscriptionBody): ChangeEventHandler<HTMLInputElement> {
		return (e) => {
			console.log(form[key], e.target.value)
			setForm({
				...form,
				[key]: moment(e.target.value, "yyyy-MM-DD").valueOf(),
			});
		}
	}

	async function submitFreeSubscription(): Promise<void> {
		props.dispatch(incrementLoading());
		try {
			await new AdminApi(getConfig(token)).giveFreeSubscription({
				giveFreeSubscriptionBody: {
					userID: form.userID,
					freeSubscriptionExpiration: form.freeSubscriptionExpiration,
				},
			});
			props.dispatch(decrementLoading());
			setForm({
				userID: user._id,
				freeSubscriptionExpiration: moment().startOf('day').add("30", "days").valueOf(),
			});
			props.onDone();
		} catch (e) {
			props.dispatch(decrementLoading());
			props.dispatch(addError(e));
		}
	}

	async function removeFreeSubscription(): Promise<void> {
		props.dispatch(incrementLoading());
		try {
			await new AdminApi(getConfig(token)).removeFreeSubscription({
				iDBody: {
					id: form.userID,
				},
			});
			props.dispatch(decrementLoading());
			setForm({
				userID: user._id,
				freeSubscriptionExpiration: moment().startOf('day').add("30", "days").valueOf(),
			});
			props.onDone();
		} catch (e) {
			props.dispatch(decrementLoading());
			props.dispatch(addError(e));
		}
	}

	return (
		<Modal
			isOpen={isOpen}
			fade={true}
			centered={true}
			toggle={closeHelper}
		>
			<ModalHeader toggle={closeHelper}>Update User Password</ModalHeader>

			<ModalBody>
				<div className="mb-3">
					<Label>
						Subscription Valid Until*
					</Label>
					<Input type="date" value={moment(form.freeSubscriptionExpiration).format("yyyy-MM-DD")} placeholder="Date" onChange={createOnChange("freeSubscriptionExpiration")}/>
				</div>

			</ModalBody>

			<ModalFooter>
				<Button color="danger" className="mr-3" onClick={removeFreeSubscription}>
					Remove Free Subscription
				</Button>
				<Button color="primary" onClick={submitFreeSubscription}>
					Apply Free Subscription
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default connect((store: IStore, props: IProps) => {
	return {
		...props,
		token: store.metaStore.token,
	}
})(ApplyFreeSubscriptionModal)
