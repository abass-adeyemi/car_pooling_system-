require('dotenv').config();
const axios = require('axios').default;
const { v4: uuidv4 } = require('uuid');

const initalizePayment = async (data) => {
	return axios({
		hostname: 'api.paystack.co',
		method: 'POST',
		url: `${process.env.PAYSTACK_BASE_URL}/transaction/initialize`,
		headers: {
			Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
			'Content-Type': 'application/json',
		},
		data: {
			email: data.email,
			amount: parseFloat(data.amount) * 100,
			currency: 'NGN',
			channels: [data.payment_channel],
			reference: data.payment_Reference,
		},
	});
};

const verifyPayment = async (payment_Reference) => {
	return axios({
		// hostname: 'api.paystack.co',
		method: 'GET',
		url: `${process.env.PAYSTACK_BASE_URL}/transaction/verify/${payment_Reference}`,
		headers: {
			Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
			'Content-Type': 'application/json',
		},
	});
};

module.exports = {
	initalizePayment,
	verifyPayment,
};
