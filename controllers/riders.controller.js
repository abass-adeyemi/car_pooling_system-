require('dotenv').config();
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const msgClass = require('../errors/errors');
const riderModel = require('../models/riders.model');
const emailServices = require('../services/emailServices');
const bcrypt = require('bcrypt');
const res = require('express/lib/response');
const { send } = require('express/lib/response');
const JoiPhone = Joi.extend(require('joi-phone-number'));
const generateOTP = () => {
	let otp = Math.floor(Math.random() * 10000);
	let fullOTP = '';
	if (otp.toString().length < 4) {
		fullOTP = '0' + otp.toString();
		return fullOTP;
	}

	fullOTP = otp;
	return fullOTP;
};
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

const createRidersProfile = async (req, res) => {
	const riderSchema = Joi.object({
		firstname: Joi.string().required(),
		surname: Joi.string().required(),
		email: Joi.string().email().required(),
		phone: JoiPhone.string().phoneNumber(),
		password: Joi.string().alphanum().required(),
		gender: Joi.string(),
	});

	const riderValidation = riderSchema.validate(req.body);
	if (riderValidation.error) {
		console.log('json error =>', riderValidation);
		res.status(422).send({
			status: false,
			message: 'Bad Request',
			data: [],
		});
	}

	const { firstname, surname, email, phone, password, gender } = req.body;
	const customer_id = uuidv4();
	const otp = generateOTP();
	/*try {
		const [err, RiderExistResult] = await riderModel.checkIfRiderExist(
			email,
			phone
		);
		if (err) {
			console.log('err =>', err);
			throw new Error('Try again please,this is on us, something happened');
		}
		if ((RiderExistResult !== '')) {
			throw new Error(msgClass.CustomerExist);
		}
		const passwordHash= await hashMyPassword(password)
		await riderModel.createNewRider(email,firstname,surname,hashMyPasswordResponse[1],phone,gender,customer_id);
		await riderModel.insertOTP(email, phone, customer_id, otp);
		await send eami
	} catch (error) {}
	*/
	//checking if the details exist in the DB

	riderModel
		.checkIfRiderExist(email, phone)
		.then((ifRiderExistResult) => {
			if (ifRiderExistResult != '') {
				// console.log('this the error =>', ifRiderExistResult);
				throw new Error(msgClass.CustomerExist);
			}
			return hashMyPassword(password);
		})
		.then((hashMyPasswordResponse) => {
			if (typeof hashMyPasswordResponse != 'object') {
				throw new Error('internal server from me');
			}
			console.log('hashMyPasswordResponse');

			return riderModel.createNewRider(
				email,
				firstname,
				surname,
				hashMyPasswordResponse[1],
				phone,
				gender,
				customer_id
			);
		})
		.then((resultOfHashMyPassword) => {
			console.log('resultOfHashMyPassword =>', resultOfHashMyPassword);
			return riderModel.insertOTP(email, phone, customer_id, otp);
		})
		.then((sendOtpResp) => {
			// console.log('message from the then block =>', responseOfInsertOTP);

			// send otp by email requires the ffg fullname=username= and otp=otp generated
			const userFullName = `${firstname} ${surname}`;
			const dataReplacement = {
				userFullName: userFullName,
				mail: email,
				otp: otp,
			};
			//  the format for the readfilesendmail is (email of the user created, Header message, dataReplacement, the html filename)
			emailServices.readFileAndSendEmail(
				email,
				'OTP VERIFICATION',
				dataReplacement,
				'sendOTP'
			);

			res.status(200).send({
				status: true,
				message: msgClass.CustomerCreated,
				data: [],
			});
		})
		.catch((Err) => {
			// console.log('error from check in catch =>', riderCheckErr);
			res.status(400).send({
				status: false,
				message: Err.message || 'something went wrong',
				Response: [],
			});
		});
};

const getRider = async (req, res) => {
	const { email } = req.params;
	console.log(email);
	return riderModel
		.getRidersDetailsByPhoneOrEmail(email)
		.then((getRiderDetails) => {
			console.log(getRiderDetails);
			if (getRiderDetails == '') {
				throw new Error(msgClass.CustomerNotFound);
			}
			delete getRiderDetails[0].password;
			delete getRiderDetails[0]['S/N'];

			res.status(200).send({
				status: true,
				message: msgClass.CustomerDetailsFetched,
				data: getRiderDetails,
			});
		})
		.catch((err) => {
			res.status(400).send({
				status: false,
				message: err.message || 'something went wrong',
			});
		});
};
const verifyOTP = async (req, res) => {
	const { email, OTP } = req.params;
	console.log(email);
	console.log(OTP);
	riderModel
		.getOTP(email, OTP)

		.then((OtpRespFromDB) => {
			console.log('OtpRespFromDB =>', OtpRespFromDB[0]);
			if (OtpRespFromDB == '') {
				throw new Error(msgClass.OtpMismatch);
			}
			const otpElaspeTime = Date.now() - OtpRespFromDB[0].created_at;
			const allowableTime = Math.floor(otpElaspeTime / 60000);
			if (allowableTime > process.env.OTPExpirationTime) {
				throw new Error(msgClass.OtpExpired);
			}
			console.log(`i got here allowableTime=>`, allowableTime);

			riderModel.deleteOTP(email, OTP);
			riderModel.isOtpVerified(email);
			return riderModel.getRidersDetailsByPhoneOrEmail(email);
		})
		.then((OTPVerificationResp) => {
			console.log('OTPVerificationResp =>', OTPVerificationResp[0]);
			const userFullname = `${OTPVerificationResp[0].firstname} ${OTPVerificationResp[0].surname}`;
			console.log(`userFullname=>`, userFullname);
			console.log(`email=>`, OTPVerificationResp[0].email);

			const data = {
				username: userFullname,
				mail: OTPVerificationResp[0].email,
			};
			//  the format for the readfilesendmail is (email of the user created, Header message, dataReplacement, the html filename)
			emailServices.readFileAndSendEmail(
				email,
				'Welcome on board',
				data,
				'welcome'
			);
			res.status(200).send({
				status: true,
				message: msgClass.OtpVerificationSuccessful,
			});
		})
		.catch((err) => {
			// to pick axios error message
			console.log('err =>', JSON.stringify(err.message));
			res.status(400).send({
				status: false,
				message: err.message || 'Something went wrong',
			});
		});
};

const resendOTP = async (req, res) => {
	const { email } = req.params;
	const OTP = generateOTP();
	console.log(`otp`, OTP);
	riderModel
		.getRidersDetailsByPhoneOrEmail(email)
		.then((getRidersResp) => {
			console.log(getRidersResp);
			if (getRidersResp == '') {
				throw new Error(msgClass.CustomerNotFound);
			}
			riderModel.deleteOtpByCustomerID(getRidersResp[0].customer_id);
			riderModel.insertOTP(
				getRidersResp[0].email,
				getRidersResp[0].phone,
				getRidersResp[0].customer_id,
				OTP
			);
		})

		.then((otpInsertResp) => {
			console.log(otpInsertResp);
			if (otpInsertResp == false) {
				throw new Error('unable to insert otp');
			}
			// const getRiderDetails = riderModel.getRidersDetailsByPhoneOrEmail;
			// console.log(getRiderDetails);
		});
};
//**************************************** */

module.exports = {
	createRidersProfile,
	verifyOTP,
	resendOTP,
	getRider,
	// ridersLogin,
};
