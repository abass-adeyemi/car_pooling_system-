const { reject } = require('bcrypt/promises');
const { promise } = require('../configuration/mysql');
const riderSQL = require('../configuration/mysql');

const createNewRider = async (
	email,
	firstname,
	surname,
	password,
	phone,
	gender,
	customer_id
) => {
	return new Promise((resolve, reject) => {
		riderSQL.query(
			{
				sql: `Insert into _riders( firstname, surname, password,email, phone, gender,customer_id)values(?,?,?,?,?,?,?)`,
				values: [
					firstname,
					surname,
					password,
					email,
					phone,
					gender,
					customer_id,
				],
			},
			(err, results, fields) => {
				if (err) {
					reject(err);
				}
				resolve(results);
			}
		);
	});
};
const updateRIder = async (email) => {
	return new promise((resolve, reject) => {
		riderSQL.query(
			{
				sql: `update _riders set phone = ?, surname= ? , firstname= ?, gender=? where email =?`,
				values: [phone, firstname, surname, gender, email],
			},
			(err, results, fields) => {
				if (err) {
					reject(err);
				}
				resolve(results);
			}
		);
	});
};
const getRidersDetailsByPhoneOrEmail = async (details) => {
	return new Promise((resolve, reject) => {
		riderSQL.query(
			{
				sql: `select * from  _riders where email=? or phone=?`,
				values: [details, details],
			},
			(err, results, fields) => {
				if (err) {
					reject(err);
				}
				resolve(results);
			}
		);
	});
};

const checkIfRiderExist = async (email, phone) => {
	return new Promise((resolve, reject) => {
		riderSQL.query(
			{
				sql: `select * from _riders where email=? or phone=?`,
				values: [email, phone],
			},
			(err, results, fields) => {
				if (err) {
					reject(err);
				}
				resolve(results);
			}
		);
	});
};

const getOTP = async (email, OTP) => {
	return new Promise((resolve, reject) => {
		riderSQL.query(
			{
				sql: `select * from _otp where email=? or phone=? and OTP=?`,
				values: [email, email, OTP],
			},
			(err, result, fields) => {
				if (err) {
					reject(err);
				}
				resolve(result);
			}
		);
	});
};

const insertOTP = async (email, phone, customer_id, otp) => {
	return new Promise((resolve, reject) => {
		riderSQL.query(
			{
				sql: `insert into _OTP( email,phone,customer_id,otp ) values(?,?,?,?)`,
				values: [email, phone, customer_id, otp],
			},
			(err, results, fields) => {
				if (err) {
					reject(err);
				}
				resolve(results);
			}
		);
	});
};

const forgetPasswordModel = async (email, phone, hash, customer_id) => {
	return new Promise((resolve, reject) => {
		riderSQL.query(
			{
				sql: `insert into _forget_password(customer_id,email, phone, hash) values(?,?,?,?)`,
				values: [email, phone, hash, customer_id],
			},
			(err, result, fields) => {
				if (err) {
					reject(err);
				}
				resolve(result);
			}
		);
	});
};

const deleteOTP = async (details, otp) => {
	return new Promise((resolve, reject) => {
		riderSQL.query(
			{
				sql: `delete from _OTP where email=? or phone=?  and OTP=?`,
				values: [details, details, otp],
			},
			(err, results, fields) => {
				if (err) {
					reject(err);
				}
				resolve(results);
			}
		);
	});
};
const deleteOtpByCustomerID = async (customerID) => {
	return new Promise((resolve, reject) => {
		riderSQL.query(
			{
				sql: `delete  from _OTP where customer_id=?`,
				values: [customerID],
			},
			(err, results, fields) => {
				if (err) {
					reject(err);
				}
				resolve(results);
			}
		);
	});
};
const isOtpVerified = async (details) => {
	return new Promise((resolve, reject) => {
		riderSQL.query(
			{
				sql: `update  _riders set isOTPVerified=? where email=? `,
				values: [1, details],
			},
			(err, result, fields) => {
				if (err) {
					reject(err);
				}
				resolve(result);
			}
		);
	});
};
const validateHash = async (hash) => {
	return new Promise((resolve, reject) => {
		riderSQL.query(
			{
				//select * from  _riders where email=? or phone=?
				sql: `select * from  _forget_password where hash=?`,
				values: [hash],
			},
			(err, result, fields) => {
				if (err) {
					reject(err);
				}
				resolve(result);
			}
		);
	});
};

const deleteHashByCustormerID = async (customer_id) => {
	return new Promise((resolve, reject) => {
		riderSQL.query(
			{
				sql: `delete from _forget_password where customer_id=?`,
				values: [customer_id],
			},
			(err, result, fields) => {
				if (err) {
					reject(err);
				}
				resolve(result);
			}
		);
	});
};
const updatePassword = async (password, customer_id) => {
	return new Promise((resolve, reject) => {
		riderSQL.query(
			{
				sql: `update _riders set password=? where customer_id=?`,
				values: [password, customer_id],
			},
			(err, result, fields) => {
				if (err) {
					reject(err);
				}
				resolve(result);
			}
		);
	});
};
module.exports = {
	createNewRider,
	updateRIder,
	getRidersDetailsByPhoneOrEmail,
	checkIfRiderExist,
	insertOTP,
	getOTP,
	deleteOTP,
	deleteOtpByCustomerID,
	isOtpVerified,
	forgetPasswordModel,
	validateHash,
	deleteHashByCustormerID,
	updatePassword,
};
