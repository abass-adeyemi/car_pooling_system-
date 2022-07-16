const express = require('express');
const router = express.Router();
// import { authentication } from '../middlewares/authentication';
const { authentication } = require('../middlewares/authentication');
const { authorization } = require('../middlewares/authorization');
const {
	createRidersProfile,
	verifyOTP,
	resendOTP,
	getRider,
	updateRider,
} = require('../controllers/riders.controller');

const {
	ridersLogin,
	startForgetPassword,
	completeForgetPassword,
} = require('../controllers/authentication.controller');
router.post('/riders/signup', createRidersProfile);
router.post('/riders/login', ridersLogin);
router.get('/riders/get-rider', authentication, getRider);
router.put('/riders/update-rider', authentication, authorization, updateRider);
router.post('/riders/login', ridersLogin);
router.get('/riders/forget-password/:email', startForgetPassword);
router.patch('/riders/complete-forget-password/:hash', completeForgetPassword);
router.get('/riders/verify-otp/:email/:OTP', verifyOTP);
router.get('/riders/resend-otp/:email', resendOTP);

module.exports = router;
