import React, {ReactNode, useState} from "react";
import BootstrapTable from "react-bootstrap-table-next";
import {Asset, Category, Class} from "client";
import moment from "moment";
import {Button} from "react-bootstrap";
import DisableClassModal from "../modals/DisableClassModal";
import EditClassModal from "../modals/EditClassModal";

interface IProps {
	data: Array<Class>;
	onDoneAction(): Promise<void>;
}

const ClassesTable: React.FC<IProps> = (props: IProps) => {

	function makeEditButtons(cell: string, row: Class): ReactNode {
		return (<EditButton class={row} onDoneAction={props.onDoneAction}/>);
	}

	function makeToggleButtons(cell: string, row: Class): ReactNode {
		return (<ToggleButton class={row} onDoneAction={props.onDoneAction}/>)
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
			noDataIndication={props?.data === undefined ? "Loading..." : "No Classes"}
			defaultSorted={[{dataField: "creationDate", order: "asc"}]}
			data={props?.data ? props.data : []}
			keyField="_id"
			columns={[
				{
					dataField: "image",
					text: "Thumbnail",
					sort: false,
					formatter: (c: Asset) => {
						return (
							<div className="d-flex justify-content-center align-items-center" style={{width: 220}}>
								<div className="image-thumbnail-container">
									<img src={c.url}/>
								</div>
							</div>
						);
					}
				},
				{
					dataField: "creationDate",
					text: "Date Created",
					sort: true,
					formatter: (t) => moment(t).format("MM/DD/YYYY")
				},
				{
					dataField: "name",
					text: "Class Name",
					sort: true,
				},
				{
					dataField: "categories",
					text: "Category",
					sort: false,
					formatter: (categories) => {
						return (
							<p className="mb-0" style={{width: 200, whiteSpace: "break-spaces"}}>
								{categories.map((c: Category, i: number) => {
									return (<span>{c.name + (i < (categories.length - 1) ? ", " : "")}</span>);
								})}
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
	)
};

interface IEditButtonProps {
	class: Class;
	onDoneAction(): Promise<void>;
}

const EditButton: React.FC<IEditButtonProps> = (props: IEditButtonProps) => {

	const [showEdit, setShowEdit] = useState(false);

	function toggleShowEdit(): void {
		setShowEdit(!showEdit);
	}

	return (
		<React.Fragment>
			<EditClassModal
				isOpen={showEdit}
				class={props.class}
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
	class: Class;
	onDoneAction(): Promise<void>;
}

const ToggleButton: React.FC<IToggleButtonProps> = (props: IToggleButtonProps) => {

	const [showDisable, setShowDisable] = useState(false);

	function toggleShowDisable(): void {
		setShowDisable(!showDisable)
	}

	return (
		<React.Fragment>
			<DisableClassModal
				isOpen={showDisable}
				class={props.class}
				onClose={toggleShowDisable}
				onDone={props.onDoneAction}
			/>

			<div className="d-flex justify-content-center">

				<Button color="blue" size="sm" className="px-5" onClick={toggleShowDisable}>
					{props.class.disabled ? "Enable" : "Disable"}
				</Button>
			</div>
		</React.Fragment>
	);
}

export default ClassesTable;
