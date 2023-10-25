import React from "react";
import {BrowserRouter, Redirect, Route, Switch} from "react-router-dom";
import ErrorManager from "./components/ErrorManager";
import LoadingManager from "./components/LoadingManager";
import TokenManager from "./components/TokenManager";
import SideBarManager from "./components/sideBar/SideBarManager";
import Login from "./pages/Login";
import NotFoundPage from "./pages/NotFoundPage";
import Dashboard from "./pages/Dashboard";
import ManageAdmins from "./pages/ManageAdmins";
import ManageUsers from "./pages/ManageUsers";
import AuthenticatedRoute from "./components/AuthenticatedRoute";
import CategoriesPage from "./pages/CategoriesPage";
import ClassesPage from "./pages/ClassesPage";
import InstructorsPage from "./pages/InstructorsPage";
import VideosPage from "./pages/VideosPage";
import CreateVideoPage from "./pages/CreateVideoPage";

const App: React.FC = () => {

	return (
		<BrowserRouter>

			<ErrorManager/>
			<LoadingManager/>
			<TokenManager/>

			<SideBarManager>
				<main className="mh-100">
					<Switch>
						<Route exact path="/" component={Login}/>
						{/*<AuthenticatedRoute exact path="/dashboard" component={Dashboard}/>*/}
						<AuthenticatedRoute exact path="/manage-admins" component={ManageAdmins}/>
						<AuthenticatedRoute exact path="/manage-users" component={ManageUsers}/>

						<AuthenticatedRoute exact path="/categories" component={CategoriesPage}/>
						<AuthenticatedRoute exact path="/classes" component={ClassesPage}/>
						<AuthenticatedRoute exact path="/instructors" component={InstructorsPage}/>
						<AuthenticatedRoute exact path="/videos" component={VideosPage}/>
						<AuthenticatedRoute exact path="/create-video" component={() => <CreateVideoPage key="create"/>}/>
						<AuthenticatedRoute exact path="/edit-video" component={() => <CreateVideoPage key="edit"/>}/>
						<Route exact path="/404" component={NotFoundPage}/>
						<Redirect to="/404"/>
					</Switch>
				</main>
			</SideBarManager>
		</BrowserRouter>
	);
};

export default App;
