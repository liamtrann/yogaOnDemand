const express = require('express');
const path = require('path');
const app = express();

app.disable('etag');
app.use(express.static(path.join(__dirname, 'build')));
app.get('/*', (req, res) => {
	res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(process.env.PORT);