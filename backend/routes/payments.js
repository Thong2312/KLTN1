const express = require("express");
const router = express.Router();
const { capturePayment, verifyPayment, sendPaymentSuccessEmail } = require("../controllers/payments");
const { auth } = require("../middleware/auth");

router.post('/capturePayment', auth, capturePayment);
router.post('/verifyPayment', auth, verifyPayment);

module.exports = router;
