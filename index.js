require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const displayRoutes = require('express-routemap');
const mySqlConnection = require('./configuration/mysql');
const { uuid4 } = require('uuidv4');
const ridersRoutes = require('./routes/rider.routes');
const paymentRoutes = require('./routes/payment.routes');

const port = process.env.PORT;

// parse application/json
app.use(bodyParser.json());

// route a

app.use(ridersRoutes);
app.use(paymentRoutes);

app.listen(port, () => {
	console.log(`i am listening on ${port}`);
	displayRoutes(app);
});

mySqlConnection.connect((err) => {
	if (err) throw err.stack;

	console.log('successfully connected: ', mySqlConnection.threadId);
});

// Error 404

app.use((req, res, next) => {
	res.status(404).send({
		status: 'error',
		message: 'Seems you got lost. so sorry',
	});
});
