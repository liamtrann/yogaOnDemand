import React, {useEffect, useState} from "react";
import {Container} from "reactstrap";
import {Button} from "react-bootstrap";
import {GetCategoriesRequest, Instructor, InstructorApi} from "client";
import {addError, decrementLoading, incrementLoading} from "../redux/meta/MetaActions";
import getConfig from "../utils/getConfig";
import InstructorsTable from "../components/tables/InstructorsTable";
import {connect} from "react-redux";
import {IStore} from "../redux/defaultStore";
import AddInstructorModal from "../components/modals/AddInstructorModal";

interface IProps {
	token?: string;
	dispatch?: any;
}

const InstructorsPage: React.FC<IProps> = (props) => {

	const [instructors, setInstructors] = useState<Array<Instructor>>(undefined);
	const [pagination, setPagination] = useState<GetCategoriesRequest>({limit: 30, offset: 0});
	const [showAdd, setShowAdd] = useState(false);

	useEffect(() => {
		getInstructors().then().catch();
	}, []);

	async function getInstructors(): Promise<void> {
		props.dispatch(incrementLoading());

		try {
			const res = await new InstructorApi(getConfig(props.token)).getInstructors(pagination);
			setInstructors(res.instructors);
		} catch (e) {
			props.dispatch(addError(e));
		}

		props.dispatch(decrementLoading());
	}

	function toggleShowAdd(): void {
		setShowAdd(!showAdd);
	}

	return (
		<React.Fragment>
			<AddInstructorModal
				isOpen={showAdd}
				onClose={toggleShowAdd}
				onDone={getInstructors}
			/>

			<Container className="my-5">
				<div className="d-flex justify-content-between flex-wrap">
					<h3 className="font-weight-bold mr-3">Instructors</h3>

					<div>
						<Button color="blue" size="sm" className="px-5" onClick={toggleShowAdd}>
							Create a New Instructor
						</Button>
					</div>
				</div>

				<hr/>

				<div>
					<InstructorsTable data={instructors} onDoneAction={getInstructors}/>
				</div>
			</Container>
		</React.Fragment>
	);
};

export default connect((store: IStore, props: IProps) => {
	return {
		token: store.metaStore.token,
		...props,
	}
})(InstructorsPage);
