require('dotenv').config();
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const msgClass = require('../errors/errors');
const riderModel = require('../models/riders.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const ridersLogin = async (req, res) => {
	const { email, password } = req.body;

	let payload;

	riderModel
		.getRidersDetailsByPhoneOrEmail(email)
		.then((responseFromGetRidersDetailsByPhoneOrEmail) => {
			if (responseFromGetRidersDetailsByPhoneOrEmail == '') {
				//log that the email does not exist
				throw new Error('Invalid Credentials');
			}

			payload = responseFromGetRidersDetailsByPhoneOrEmail[0];

			return bcrypt.compare(password, payload.password);
		})
		.then((resultFromPasswordCompare) => {
			// console.log('resultFromPasswordCompare', resultFromPasswordCompare);
			if (resultFromPasswordCompare == false) {
				throw new Error('Invalid Email or Password');
			}
		})
		.then((resultFromLogin) => {
			const dataToAddInMyPayload = {
				email: payload.email,
				isAdmin: false,
				_id: uuidv4(),
			};
			jwt.sign(
				dataToAddInMyPayload,
				process.env.JWT_SECRET,
				{ expiresIn: process.env.JWT_EXPIRES_TIME },
				(err, token) => {
					if (err) {
						console.log('err', err);
						throw new Error('Something went wrong');
					}
					console.log('token login=>', token);
					res.setHeader('token', token);
					// res.setHeader('token', token);
					console.log('token login222=>', token);
					res.status(200).send({
						status: true,
						message: msgClass.LoginSuccessful || 'Successfully logged in ',
					});
				}
			);
		})

		.catch((err) => {
			res.status(400).send({
				status: false,
				message: err.message || 'Something went wrong',
			});
		});
};

module.exports = {
	ridersLogin,
};
