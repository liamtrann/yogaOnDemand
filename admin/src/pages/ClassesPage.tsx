import React, {useEffect, useState} from "react";
import {Container} from "reactstrap";
import {Button} from "react-bootstrap";
import {ClassApi, GetCategoriesRequest} from "client";
import {connect} from "react-redux";
import {IStore} from "../redux/defaultStore";
import {addError, decrementLoading, incrementLoading} from "../redux/meta/MetaActions";
import ClassesTable from "../components/tables/ClassesTable";
import getConfig from "../utils/getConfig";
import AddClassModal from "../components/modals/AddClassModal";

interface IProps {
	token?: string;
	dispatch?: any;
}

const ClassesPage: React.FC<IProps> = (props) => {

	const [classes, setClasses] = useState(undefined);
	const [pagination, setPagination] = useState<GetCategoriesRequest>({limit: 30, offset: 0});
	const [showAdd, setShowAdd] = useState(false);

	useEffect(() => {
		getClasses().then().catch();
	}, []);

	async function getClasses(): Promise<void> {
		props.dispatch(incrementLoading());

		try {
			const res = await new ClassApi(getConfig(props.token)).getClasses(pagination);
			setClasses(res.classes);
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
			<AddClassModal
				isOpen={showAdd}
				onClose={toggleShowAdd}
				onDone={getClasses}
			/>

			<Container className="my-5">
				<div className="d-flex justify-content-between flex-wrap">
					<h3 className="font-weight-bold mr-3">Classes</h3>

					<div>
						<Button color="blue" size="sm" className="px-5" onClick={toggleShowAdd}>
							Create a New Class
						</Button>
					</div>
				</div>

				<hr/>

				<div>
					<ClassesTable data={classes} onDoneAction={getClasses}/>
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
})(ClassesPage);
