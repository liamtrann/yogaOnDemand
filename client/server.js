const express = require('express');
const yaml = require('yamljs');
const logo = require("./headerImage");
const swaggerUi = require('swagger-ui-express');

// override the css in the swagger
const customCss = `
.topbar-wrapper img[alt="Swagger UI"] {
	content: url('${logo}')
}`


// deliver the docs at "/docs" (must be route not at "/" for static serving)
const app = express();
app.use('/docs', (req, res, next) => {
	req.swaggerDoc = yaml.load('./openapi.yaml');
	next();
}, swaggerUi.serve, swaggerUi.setup(undefined, {customCss}))
app.listen(process.env.PORT);