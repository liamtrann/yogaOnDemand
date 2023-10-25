import React, {ReactNode, useState} from "react";
import BootstrapTable from "react-bootstrap-table-next";
import {Button} from "react-bootstrap";
import moment from "moment";
import {Asset, Category} from "client";
import EditCategoryModal from "../modals/EditCategoryModal";
import DisableCategoryModal from "../modals/DisableCategoryModal";

interface IProps {
	data: Array<Category>;
	onDoneAction(): Promise<void>;
}

const CategoriesTable: React.FC<IProps> = (props: IProps) => {

	function makeEditButtons(cell: string, row: Category): ReactNode {
		return (<EditButton category={row} onDoneAction={props.onDoneAction}/>)
	}

	function makeToggleButtons(cell: string, row: Category): ReactNode {
		return (<ToggleButton category={row} onDoneAction={props.onDoneAction}/>)
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
			noDataIndication={props?.data === undefined ? "Loading..." : "No Categories"}
			defaultSorted={[{dataField: "creationDate", order: "asc"}]}
			data={props?.data ? props?.data : []}
			keyField="_id"
			columns={[
				{
					dataField: "image",
					text: "Thumbnail",
					sort: false,
					formatter: (c: Asset) => {
						return (
							<div className="d-flex justify-content-center align-items-center" style={{width: 220}}>
								{c ? (
									<div className="image-thumbnail-container">
										<img src={c.url}/>
									</div>
								) : (
									<span className="font-italic">No Image Set.</span>
								)}
							</div>
						);
					}
				},
				{
					dataField: "name",
					text: "Category Name",
					sort: true,
				},
				{
					dataField: "creationDate",
					text: "Date Created",
					sort: true,
					formatter: (t) => moment(t).format("MM/DD/YYYY")
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
	category: Category;
	onDoneAction(): Promise<void>;
}

const EditButton: React.FC<IEditButtonProps> = (props: IEditButtonProps) => {

	const [showEdit, setShowEdit] = useState(false);

	function toggleShowEdit(): void {
		setShowEdit(!showEdit);
	}

	return (
		<div className="d-flex justify-content-center">
			<EditCategoryModal
				isOpen={showEdit}
				category={props.category}
				onClose={toggleShowEdit}
				onDone={props.onDoneAction}
			/>

			<Button color="blue" size="sm" className="px-5" onClick={toggleShowEdit}>
				Edit
			</Button>
		</div>
	);
}

interface IToggleButtonProps {
	category: Category;
	onDoneAction(): Promise<void>;
}

const ToggleButton: React.FC<IToggleButtonProps> = (props: IToggleButtonProps) => {

	const [showDisable, setShowDisable] = useState(false);

	function toggleShowDisable(): void {
		setShowDisable(!showDisable)
	}

	return (
		<div className="d-flex justify-content-center">
			<DisableCategoryModal
				isOpen={showDisable}
				category={props.category}
				onClose={toggleShowDisable}
				onDone={props.onDoneAction}
			/>

			<Button color="blue" size="sm" className="px-5" onClick={toggleShowDisable}>
				{props.category.disabled ? "Enable" : "Disable"}
			</Button>
		</div>
	);
}

export default CategoriesTable;
