module.exports = {
	info: {
		title: process.env.REACT_APP_PROJECT_NAME,
		description: "This is the API documentation generated from the swagger comments in the backend. These correspond directly to the client library.",
		version: process.env.REACT_APP_VERSION
	},
	servers: [
		{
			url: process.env.REACT_APP_BACKEND_URL,
			description: "Backend url set by environment variable \"REACT_APP_BACKEND_URL\"."
		},
	],
	openapi: '3.0.3',
};