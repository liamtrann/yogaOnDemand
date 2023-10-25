import React, {useEffect, useState} from "react";
import {Container} from "reactstrap";
import {Button} from "react-bootstrap";
import CategoriesTable from "../components/tables/CategoriesTable";
import {connect} from "react-redux";
import {IStore} from "../redux/defaultStore";
import {addError, decrementLoading, incrementLoading} from "../redux/meta/MetaActions";
import {Category, CategoryApi, GetCategoriesRequest} from "client";
import getConfig from "../utils/getConfig";
import AddCategoryModal from "../components/modals/AddCategoryModal";

interface IProps {
	token?: string;
	dispatch?: any;
}

const CategoriesPage: React.FC<IProps> = (props) => {

	const [categories, setCategories] = useState<Array<Category>>(undefined);
	const [pagination, setPagination] = useState<GetCategoriesRequest>({limit: 30, offset: 0});
	const [showAdd, setShowAdd] = useState(false);

	useEffect(() => {
		getCategories().then().catch();
	}, []);

	async function getCategories(): Promise<void> {
		props.dispatch(incrementLoading());

		try {
			const res = await new CategoryApi(getConfig(props.token)).getCategories(pagination);
			setCategories(res.categories);
			// todo pagination
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
			<AddCategoryModal
				isOpen={showAdd}
				onClose={toggleShowAdd}
				onDone={getCategories}
			/>

			<Container className="my-5">
				<div className="d-flex justify-content-between flex-wrap">
					<h3 className="font-weight-bold mr-3">Categories</h3>

					<div>
						<Button color="blue" size="sm" className="px-5" onClick={toggleShowAdd}>
							Create a New Category
						</Button>
					</div>
				</div>

				<hr/>

				<div>
					<CategoriesTable data={categories} onDoneAction={getCategories}/>
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
})(CategoriesPage);
