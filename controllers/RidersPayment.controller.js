require('dotenv').config();
const { json } = require('body-parser');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const { customAlphabet } = require('nanoid/async');
const nanoid = customAlphabet('1234567890abcdef', 10);
const errors = require('../errors/errors');
const msgClass = require('../errors/errors');

const paymentModel = require('../models/payment.model');
const {
	initalizePayment,
	verifyPayment,
} = require('../services/payment.services');

const RidersPayment = async (req, res) => {
	const RidePaymentSchema = Joi.object({
		amount: Joi.string().required(),
		email: Joi.string().email().required(),
		payment_channel: Joi.string()
			.valid('card', 'banktransfer', 'ussd')
			.required(),
	});
	const { email, amount, payment_channel } = req.body;
	const responseFromJoiValidation = RidePaymentSchema.validate({
		email,
		amount,
		payment_channel,
	});
	const customer_id = uuidv4();
	const payment_Reference = await nanoid();
	const paystack_data = { email, amount, payment_channel, payment_Reference };
	console.log('responseFromJoiValidation', responseFromJoiValidation);
	if (responseFromJoiValidation.error) {
		throw new Error('Bad Request please add field');
	}

	initalizePayment(paystack_data)
		.then((paymentInitializationResponseFromPaystack) => {
			console.log(
				'paymentInitializationResponseFromPaystack:=>',
				JSON.stringify(paymentInitializationResponseFromPaystack.data.status)
			);
			if (paymentInitializationResponseFromPaystack.data.status == false) {
				throw new Error('sorry payment cannot be initialize');
			}

			paymentModel.createPayment(
				email,
				customer_id,
				amount,
				payment_Reference,
				payment_channel
			);
			// return insertPayment;

			res.status(200).send({
				status: true,
				message: 'Transaction successfully initiated',
				data: paymentInitializationResponseFromPaystack.data.data,
			});
		})

		.catch((err) => {
			// to pick axios error message
			// console.log('err =>', JSON.stringify(err.response.data.message));
			res.status(400).send({
				status: false,
				message: err.message || 'Something went wrong',
			});
		});
};

const verifyRidersPayment = async (req, res) => {
	const { payment_Reference } = req.params;
	verifyPayment(payment_Reference)
		.then((responseFromVerifyPayment) => {
			console.log('payment_Reference=>', JSON.stringify(payment_Reference));
			console.log('responseFromVerifyPayment=>', responseFromVerifyPayment);
			if (responseFromVerifyPayment.data.status == false) {
				throw new Error('the payment cannot be verified');
			}
			res.status(200).send({
				status: true,
				message: 'Transaction successfully initiated',
				data: responseFromVerifyPayment.data.data,
			});
		})
		.catch((err) => {
			res.status(400).send({
				status: false,
				message: err.message || 'Something went wrong',
			});
		});
};

module.exports = { RidersPayment, verifyRidersPayment };
