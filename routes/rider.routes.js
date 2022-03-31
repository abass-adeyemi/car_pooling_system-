const express = require('express');
const router = express.Router();

const {
	createRidersProfile,
	verifyOTP,
	resendOTP,
} = require('../controllers/riders.controller');

const { ridersLogin } = require('../controllers/authentication.controller');
router.post('/riders/signup', createRidersProfile);
router.post('/riders/login', ridersLogin);
router.get('/riders/verify-otp/:email/:OTP', verifyOTP);
router.get('/riders/verify-otp/:email', resendOTP);

module.exports = router;
