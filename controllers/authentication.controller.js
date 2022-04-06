require('dotenv').config();
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const msgClass = require('../errors/errors');
const riderModel = require('../models/riders.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const emailServices = require('../services/emailServices');

const saltRounds = 10;
const hashMyPassword = (mypassword) => {
	return new Promise((resolve, reject) => {
		bcrypt.genSalt(saltRounds, (err, salt) => {
			bcrypt.hash(mypassword, salt, (err, hash) => {
				if (err) {
					reject(err);
				}
				resolve([salt, hash]);
			});
		});
	});
};
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
					res.setHeader('token', token);
					// res.setHeader('token', token);
					// console.log('token login222=>', token);
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
const startForgetPassword = async (req, res) => {
	const { email } = req.params;
	const hash = uuidv4().replace(/-/gi, '');
	let fullname;

	riderModel
		.getRidersDetailsByPhoneOrEmail(email)
		.then((riderExistResp) => {
			console.log('hey=>', riderExistResp);
			if (riderExistResp == '') {
				console.log('hey=>3');

				throw new Error('if you will receive an email if your email exist');
			}

			fullname = `${riderExistResp[0].firstname}  ${riderExistResp[0].surname}`;
			riderModel.deleteHashByCustormerID(riderExistResp[0].customer_id);
			return riderModel.forgetPasswordModel(
				riderExistResp[0].customer_id,
				riderExistResp[0].email,
				riderExistResp[0].phone,
				hash
			);
		})
		.then((respFromHash) => {
			console.log('respFromHash=>', respFromHash);
			if (respFromHash == undefined || null) {
				throw new Error('Please try This is on us, something went wrong');
			}
			let dataReplacement = {
				fullname: ` ${fullname}  `,
				resetPasswordlink: `${process.env.RESET_PASSWORD_LINK}/${hash}`,
			};
			console.log('fullname', fullname);
			//send email
			emailServices.readFileAndSendEmail(
				email,
				'RESET PASSWORD',
				dataReplacement,
				'forgetPassword'
			);

			res.status(200).send({
				status: true,
				message: `If the email ${email} account exist with us, you will get a reset password email`,
			});
		})
		.catch((err) => {
			res.status(400).send({
				status: false,
				message: err.message || 'Something went wrong',
			});
		});
};
const completeForgetPassword = async (req, res) => {
	const { hash } = req.params;
	const { newPassword, confirmNewPassword } = req.body;
	const newUser = [];

	if (newPassword !== confirmNewPassword) {
		res.status(400).send({
			status: false,
			message: 'password mismatch',
		});
	} else {
		riderModel
			.validateHash(hash)
			.then((hashValidateResp) => {
				// console.log('hashValidationResp  =>', hashValidateResp);
				if (hashValidateResp.length === 0) {
					throw new Error('unable to perform this operation', 400);
				}
				newUser.push(hashValidateResp[0]);
				// console.log('newUser  =>', newUser);
				return hashMyPassword(newPassword);
			})
			.then((hashPasswordResp) => {
				// console.log('hashPasswordResp[1]  =>', hashPasswordResp[1]);
				if (typeof hashPasswordResp !== 'object') {
					throw new Error(
						"action can't be completed Internal Server error this on us"
					);
				}
				// console.log('hashPasswordResp =>', hashPasswordResp);
				return riderModel.updatePassword(
					hashPasswordResp[1],
					newUser[0].customer_id
				);
			})

			.then((hey) => {
				if (typeof hey != 'object') {
					throw new Error(
						"action can't be completed Internal Server error this on us"
					);
				}

				res.status(200).send({
					status: true,
					message: 'password successsfully updated',
				});
			})

			.catch((err) => {
				res.status(400).send({
					status: false,
					message: err.message || 'something went wrong contact support',
				});
			});
	}
};
module.exports = {
	ridersLogin,
	startForgetPassword,
	completeForgetPassword,
};
