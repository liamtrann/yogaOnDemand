import React from "react";
import {Button, Container} from "reactstrap";
import {NavLink} from "react-router-dom";

const NotFoundPage: React.FC = () => {

	return (
		<div className="vh-100 d-flex align-items-center">
			<Container className="d-flex justify-content-center">
				<div>
					<img
						src={process.env.PUBLIC_URL + "/images/404.png"}
						style={{maxWidth: "100%", width: 500}}
						className="mb-5"
						alt="404 Graphic"
					/>

					<h4 className="text-center mb-4">
						404 - The page you're looking for doesn't exist.
					</h4>

					<div className="d-flex justify-content-center">
						<NavLink to="/categories">
							<Button color="success">
								Go Home
							</Button>
						</NavLink>
					</div>
				</div>
			</Container>
		</div>
	);
};

export default NotFoundPage;
