import React, {ReactNode, useState} from "react";
import BootstrapTable from "react-bootstrap-table-next";
import {Button} from "react-bootstrap";
import moment from "moment";
import {Instructor} from "client";
import EditInstructorModal from "../modals/EditInstructorModal";
import DisableInstructorModal from "../modals/DisableInstructorModal";

interface IProps {
	data: Array<Instructor>;
	onDoneAction(): Promise<void>;
}

const InstructorsTable: React.FC<IProps> = (props: IProps) => {

	function makeEditButtons(cell: string, row: Instructor): ReactNode {
		return (<EditButton instructor={row} onDoneAction={props.onDoneAction}/>)
	}

	function makeToggleButtons(cell: string, row: Instructor): ReactNode {
		return (<ToggleButton instructor={row} onDoneAction={props.onDoneAction}/>)
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
			noDataIndication={props?.data === undefined ? "Loading..." : "No Instructors"}
			defaultSorted={[{dataField: "creationDate", order: "asc"}]}
			data={props?.data ? props?.data : []}
			keyField="_id"
			columns={[
				{
					dataField: "image",
					text: "Picture",
					sort: false,
					formatter: (c) => {
						return (
							<div className="d-flex justify-content-center align-items-center">
								<img
									style={{
										width: 60,
										height: 60,
										borderRadius: "50%",
										objectFit: "cover"
									}}
									src={c.url}
								/>
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
					dataField: "name",
					text: "Instructor Name",
					sort: true,
				},
				{
					dataField: "description",
					text: "Description",
					sort: true,
					formatter: (c) => {
						return (
							<p
								style={{
									width: 320,
									whiteSpace: "initial",
									height: "100%",
									marginBottom: 0,
								}}
							>
								{c}
							</p>
						);
					}
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
	instructor: Instructor;
	onDoneAction(): Promise<void>;
}

const EditButton: React.FC<IEditButtonProps> = (props: IEditButtonProps) => {

	const [showEdit, setShowEdit] = useState(false);

	function toggleShowEdit(): void {
		setShowEdit(!showEdit);
	}

	return (
		<React.Fragment>
			<EditInstructorModal
				isOpen={showEdit}
				instructor={props.instructor}
				onClose={toggleShowEdit}
				onDone={props.onDoneAction}
			/>

			<div className="d-flex justify-content-center">
				<Button color="blue" size="sm" className="px-5" onClick={toggleShowEdit}>
					Edit
				</Button>
			</div>
		</React.Fragment>
	);
}

interface IToggleButtonProps {
	instructor: Instructor;
	onDoneAction(): Promise<void>;
}

const ToggleButton: React.FC<IToggleButtonProps> = (props: IToggleButtonProps) => {
	const [showDisable, setShowDisable] = useState(false);

	function toggleShowDisable(): void {
		setShowDisable(!showDisable)
	}

	return (
		<React.Fragment>
			<DisableInstructorModal
				isOpen={showDisable}
				instructor={props.instructor}
				onClose={toggleShowDisable}
				onDone={props.onDoneAction}
			/>

			<div className="d-flex justify-content-center">
				<Button color="blue" size="sm" className="px-5" onClick={toggleShowDisable}>
					{props.instructor.disabled ? "Enable" : "Disable"}
				</Button>
			</div>
		</React.Fragment>
	);
}

export default InstructorsTable;
