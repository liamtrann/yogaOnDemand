import React from "react";
import {connect} from "react-redux";
import {Class, ClassApi, Video, VideoApi} from "client";
import {IStore} from "../../redux/defaultStore";
import {Button, Modal, ModalBody, ModalHeader} from "reactstrap";
import {addError, decrementLoading, incrementLoading} from "../../redux/meta/MetaActions";
import getConfig from "../../utils/getConfig";

interface IProps {
	token?: string;
	dispatch?: any;
	isOpen: boolean;
	video: Video;
	onClose(): void;
	onDone(): Promise<void>;
}

const DisableVideoModal: React.FC<IProps> = (props) => {

	async function disableVideo(): Promise<void> {
		props.dispatch(incrementLoading());

		try {
			await new VideoApi(getConfig(props.token)).disableVideo({
				iDBody: {
					id: props?.video?._id,
				},
			});
			props.dispatch(decrementLoading());
			props.onClose();
			await props.onDone();
		} catch (e) {
			props.dispatch(decrementLoading());
			props.dispatch(addError(e));
		}
	}

	return (
		<Modal
			isOpen={props.isOpen}
			fade={true}
			centered={true}
			toggle={props.onClose}
		>
			<ModalHeader toggle={props.onClose}>Disable Video</ModalHeader>

			<ModalBody>
				<p>
					Are you sure you want to disable the <b className="text-blue">{props?.video?.name}</b> video?
				</p>

				<div className="d-flex justify-content-end">
					<Button color="blue" size="sm" onClick={disableVideo}>
						Yes, Disable
					</Button>
				</div>
			</ModalBody>
		</Modal>
	);
};

export default connect((store: IStore, props: IProps) => {
	return {
		token: store.metaStore.token,
		...props,
	}
})(DisableVideoModal);
