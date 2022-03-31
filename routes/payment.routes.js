const express = require('express');
const router = express.Router();

const {
	RidersPayment,
	verifyRidersPayment,
} = require('../controllers/RidersPayment.controller');

router.post('/riders/payment', RidersPayment);
router.get('/riders/verifyPayment/:payment_Reference', verifyRidersPayment);

module.exports = router;
