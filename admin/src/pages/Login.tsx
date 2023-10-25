import React, {ChangeEventHandler, useState} from "react";
import {connect} from "react-redux";
import {Button, Card, CardBody, Container, Input, Label} from "reactstrap";
import {addError, decrementLoading, incrementLoading, login} from "../redux/meta/MetaActions";
import {AdminApi, AdminLoginBody} from "client";
import getConfig from "../utils/getConfig";
import {useHistory} from "react-router";

interface IProps {
	dispatch?: any;
}

const defaultLoginForm: AdminLoginBody = {
	username: "",
	password: "",
};

const Login: React.FC<IProps> = (props: IProps) => {

	const history = useHistory();
	const [form, setForm] = useState<AdminLoginBody>(defaultLoginForm);

	function createOnChange(key: keyof AdminLoginBody): ChangeEventHandler<HTMLInputElement> {
		return (e) => {
			setForm({
				...form,
				[key]: e.target.value,
			});
		}
	}

	async function submitLogin(e): Promise<void> {
		if (e) {e.preventDefault()}

		props.dispatch(incrementLoading());

		try {
			const res = await new AdminApi(getConfig()).adminLogin({
				adminLoginBody: {
					username: form.username,
					password: form.password,
				}
			});

			props.dispatch(decrementLoading());
			props.dispatch(login(res.token));
			history.push("/categories");
		} catch (e) {
			props.dispatch(decrementLoading());
			props.dispatch(addError(e));
		}
	}

	return (
		<div className="vh-100 vw-100 login-background">
			<Container className="vh-100 d-flex flex-column justify-content-center align-items-center">
				<Card className="w-100" style={{maxWidth: 400}}>
					<CardBody>
						<h3 className="mb-3">
							Admin Login
						</h3>

						<form>
							<div className="mb-3">
								<Label>Username</Label>
								<Input value={form.username} onChange={createOnChange("username")}/>
							</div>

							<div className="mb-3">
								<Label>Password</Label>
								<Input type="password" value={form.password} onChange={createOnChange("password")}/>
							</div>

							<div className="d-flex justify-content-end">
								<Button color="primary" type="submit" onClick={submitLogin}>
									Log In
								</Button>
							</div>
						</form>

						<hr className="my-4"/>

						<div>
							<h5 className="text-center">
								Powered by
							</h5>
							<a href="https://www.frameonesoftware.com" target="_blank"
							   className="d-flex justify-content-center align-items-start">
								<img
									src={process.env.PUBLIC_URL + "/logos/frame-one-logo.png"}
									style={{maxWidth: "60%"}}
								/>
							</a>

						</div>
					</CardBody>
				</Card>

				<div className="mt-4 text-white">
					<p className="text-center mb-0">
						{process.env.REACT_APP_PROJECT_NAME}
					</p>
					<p className="text-center mb-0">
						{process.env.REACT_APP_VERSION}
					</p>
				</div>

			</Container>
		</div>
	);
};

export default connect()(Login);
