const express = require('express');
const router = express.Router();

const {
	createRidersProfile,
	verifyOTP,
	resendOTP,
	getRider,
} = require('../controllers/riders.controller');

const { ridersLogin } = require('../controllers/authentication.controller');
router.post('/riders/signup', createRidersProfile);
router.post('/riders/login', ridersLogin);
router.get('/riders/get-rider/:email', getRider);
router.post('/riders/login', ridersLogin);
router.get('/riders/verify-otp/:email/:OTP', verifyOTP);
router.get('/riders/resend-otp/:email', resendOTP);

module.exports = router;
