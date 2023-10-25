import React, {ReactNode, useState} from "react";
import {Category, Class, Instructor, Video} from "client";
import BootstrapTable from "react-bootstrap-table-next";
import moment from "moment";
import EditClassModal from "../modals/EditClassModal";
import {Button} from "react-bootstrap";
import DisableClassModal from "../modals/DisableClassModal";
import DisableVideoModal from "../modals/DisableVideoModal";
import {useHistory} from "react-router-dom";

interface IProps {
	data: Array<Video>;
	onDoneAction(): Promise<void>;
}

const VideosTable: React.FC<IProps> = (props) => {

	function makeEditButtons(cell: string, row: Video): ReactNode {
		return (<EditButton video={row} onDoneAction={props.onDoneAction}/>);
	}

	function makeToggleButtons(cell: string, row: Video): ReactNode {
		return (<ToggleButton video={row} onDoneAction={props.onDoneAction}/>)
	}

	return (
		<BootstrapTable
			bootstrap4={true}
			striped={false}
			hover={true}
			condensed={true}
			bordered={true}
			wrapperClasses="table-responsive"
			rowStyle={{whiteSpace: "nowrap"}}
			noDataIndication={props?.data === undefined ? "Loading..." : "No Videos"}
			defaultSorted={[{dataField: "creationDate", order: "asc"}]}
			data={props?.data ? props?.data : []}
			keyField="_id"
			columns={[
				{
					dataField: "image",
					text: "Thumbnail",
					sort: false,
					classes: "d-flex justify-content-center",
					formatter: (c) => {
						return (
							<div className="d-flex justify-content-center align-items-center" style={{width: 220}}>
								<div className="image-thumbnail-container">
									<img src={c.url}/>
								</div>
							</div>
						);
					},
				},
				{
					dataField: "creationDate",
					text: "Date Created",
					sort: true,
					formatter: (t) => moment(t).format("MM/DD/YYYY")
				},
				{
					dataField: "isTopPick",
					text: "Top Pick",
					sort: true,
					formatter: (t) => t === true ? "✔" : "✖",
					classes: (t) => "top-pick-table-class text-center " + (t === true ? "text-success" : "text-danger"),
				},
				{
					dataField: "hidden",
					text: "Hidden",
					sort: true,
					formatter: (t) => t === true ? "✔" : "✖",
					classes: (t) => "top-pick-table-class text-center " + (t === true ? "text-success" : "text-danger"),
				},
				{
					dataField: "name",
					text: "Video Name",
					sort: true,
				},
				{
					dataField: "_class",
					text: "Class Name",
					sort: true,
					formatter: (c: Class) => {
						return c.name
					}
				},
				{
					dataField: "categories",
					text: "Category",
					sort: true,
					formatter: (categories: Array<Category>) => {
						return (
							<p className="mb-0" style={{width: 200, whiteSpace: "break-spaces"}}>
								{categories.map(c => c.name).join(", ")}
							</p>
						);
					},
				},
				{
					dataField: "instructor",
					text: "Instructor",
					sort: true,
					formatter: (c: Instructor) => {return c.name}
				},
				{
					dataField: "edit",
					text: "Edit",
					sort: false,
					formatter: makeEditButtons,
				},
				{
					dataField: "toggle",
					text: "Disable",
					sort: false,
					formatter: makeToggleButtons,
				},
			]}
		/>
	);
};

interface IEditButtonProps {
	video: Video;
	onDoneAction(): Promise<void>;
}

const EditButton: React.FC<IEditButtonProps> = (props: IEditButtonProps) => {

	const history = useHistory();

	function onEdit(): void {
		history.push(`/edit-video?video=${props?.video?._id}`);
	}

	return (
		<React.Fragment>
			<div className="d-flex justify-content-center">
				<Button color="blue" size="sm" className="px-5" onClick={onEdit}>
					Edit
				</Button>
			</div>
		</React.Fragment>
	);
}

interface IToggleButtonProps {
	video: Video;
	onDoneAction(): Promise<void>;
}

const ToggleButton: React.FC<IToggleButtonProps> = (props: IToggleButtonProps) => {

	const [showDisable, setShowDisable] = useState(false);

	function toggleShowDisable(): void {
		setShowDisable(!showDisable)
	}

	return (
		<React.Fragment>
			<DisableVideoModal
				isOpen={showDisable}
				video={props.video}
				onClose={toggleShowDisable}
				onDone={props.onDoneAction}
			/>

			<div className="d-flex justify-content-center">

				<Button color="blue" size="sm" className="px-5" onClick={toggleShowDisable}>
					{props.video.disabled ? "Enable" : "Disable"}
				</Button>
			</div>
		</React.Fragment>
	);
}

export default VideosTable;
