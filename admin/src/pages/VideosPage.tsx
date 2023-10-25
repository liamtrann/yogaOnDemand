import React, {useEffect, useState} from "react";
import {Container, Input} from "reactstrap";
import {connect} from "react-redux";
import {IStore} from "../redux/defaultStore";
import {Button} from "react-bootstrap";
import {NavLink} from "react-router-dom";
import {GetCategoriesRequest, Video, VideoApi} from "client";
import {addError, decrementLoading, incrementLoading} from "../redux/meta/MetaActions";
import getConfig from "../utils/getConfig";
import VideosTable from "../components/tables/VideosTable";

interface IProps {
	token?: string;
	dispatch?: any;
}

const VideosPage: React.FC<IProps> = (props) => {

	const [videos, setVideos] = useState<Array<Video>>([]);
	const [pagination, setPagination] = useState<GetCategoriesRequest>({limit: 30, offset: 0});
	const [searchString, setSearchString] = useState("");

	useEffect(() => {
		getVideos().then().catch();
	}, [])

	async function getVideos(): Promise<void> {
		props.dispatch(incrementLoading());

		try {
			const res = await new VideoApi(getConfig(props.token)).searchForVideos({
				...pagination,
				searchString: searchString.length > 0 ? searchString : undefined,
				classID: undefined,
			});
			setVideos(res.videos)
		} catch (e) {
			props.dispatch(addError(e));
		}

		props.dispatch(decrementLoading());
	}

	function onSearchChange(e): void {
		setSearchString(e.target.value);
	}

	return (
		<Container className="my-5">
			<div className="d-flex justify-content-between flex-wrap">
				<h3 className="font-weight-bold mr-3">Videos</h3>

				<div>
					<NavLink to="/create-video">
						<Button color="blue" size="sm" className="px-5">
							Create a New Video
						</Button>
					</NavLink>
				</div>
			</div>

			<hr/>

			<div className="mb-3 d-flex flex-wrap">
				<div style={{width: 300}} className="mb-3 mr-3">
					<Input
						placeholder="Search..."
						value={searchString}
						onChange={onSearchChange}
					/>
				</div>

				<div>
					<Button color="blue" className="px-3" style={{height: 50}} onClick={getVideos}>Search</Button>
				</div>
			</div>

			<div>
				<VideosTable data={videos} onDoneAction={getVideos}/>
			</div>
		</Container>
	);
};

export default connect((store: IStore, props: IProps) => {
	return {
		token: store.metaStore.token,
		...props,
	}
})(VideosPage);
