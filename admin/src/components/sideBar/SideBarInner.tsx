import React, {useState} from "react";
import {Nav, Navbar, NavItem} from "reactstrap";
import {NavLink, useHistory} from "react-router-dom";
import {connect} from "react-redux";
import {IStore} from "../../redux/defaultStore";
import {logout, toggleSideBar} from "../../redux/meta/MetaActions";
import AssetManager from "../assetManager/AssetManager";

interface IProps {
	token?: string;
	dispatch?: any;
	sideBarVisible?: boolean;
}

const SideBarInner: React.FC<IProps> = (props: IProps) => {

	const history = useHistory();
	const [showAssetManager, setShowAssetManager] = useState(false);

	function toggleAssetManager(e): void {
		if (e) {
			e.preventDefault();
		}
		setShowAssetManager(!showAssetManager);
	}

	function closeSideBarHelper(): void {
		if (props.sideBarVisible) {
			props.dispatch(toggleSideBar(false));
		}
	}

	function logoutDispatcher(e): void {
		if (e) {
			e.preventDefault();
		}

		closeSideBarHelper();
		props.dispatch(logout());
		history.push("/");
	}

	return (
		<React.Fragment>
			<AssetManager
				isOpen={showAssetManager}
				allowSelect={false}
				onClose={toggleAssetManager}
			/>

			<div className="w-100">
				<Navbar color="black" dark>
					<Nav navbar className="w-100">
						<h4 className="text-light font-weight-bold">The Yoga Bar -<br/>On Demand</h4>

						<NavItem>
							<NavLink exact to="/manage-admins" onClick={closeSideBarHelper}
							         className="text-decoration-none nav-link">Manage Admins</NavLink>
						</NavItem>

						<NavItem>
							<NavLink exact to="/manage-users" onClick={closeSideBarHelper}
							         className="text-decoration-none nav-link">Manage Users</NavLink>
						</NavItem>

						<NavItem>
							<NavLink exact to="/categories" onClick={closeSideBarHelper}
							         className="text-decoration-none nav-link">Categories</NavLink>
						</NavItem>

						<NavItem>
							<NavLink exact to="/classes" onClick={closeSideBarHelper}
							         className="text-decoration-none nav-link">Classes</NavLink>
						</NavItem>

						<NavItem>
							<NavLink exact to="/instructors" onClick={closeSideBarHelper}
							         className="text-decoration-none nav-link">Instructors</NavLink>
						</NavItem>

						<NavItem>
							<NavLink exact to="/videos" onClick={closeSideBarHelper}
							         className="text-decoration-none nav-link">Videos</NavLink>
						</NavItem>

						<NavItem>
							<NavLink exact to="/create-video" onClick={closeSideBarHelper}
							         className="text-decoration-none nav-link">Create a New Video</NavLink>
						</NavItem>

						<NavItem>
							<a href="#" onClick={toggleAssetManager} className="nav-link">Open Asset Manager</a>
						</NavItem>

						{props.token && (
							<NavItem>
								<a href="#" onClick={logoutDispatcher} className="nav-link text-danger">
									Logout
								</a>
							</NavItem>
						)}

						<div className="text-white" style={{fontSize: "0.85rem"}}>
							<hr className="bg-white"/>
							<p className="mb-0">
								{process.env.REACT_APP_PROJECT_NAME}
							</p>
							<p className="mb-0">
								{process.env.REACT_APP_VERSION}
							</p>
						</div>
					</Nav>
				</Navbar>
			</div>
		</React.Fragment>
	);
};

export default connect((store: IStore, props: IProps) => {
	return {
		...props,
		token: store.metaStore.token,
		sideBarVisible: store.metaStore.sidebarVisible,
	}
})(SideBarInner);
