const express = require("express");
const router = express.Router();
const { capturePayment, verifyPayment, sendPaymentSuccessEmail } = require("../controllers/payments");
const { auth } = require("../middleware/auth");

router.post("/paypal/create-payment", auth, capturePayment);
router.post("/paypal/execute-payment", auth, verifyPayment);
router.post("/paypal/payment-success-email", auth, sendPaymentSuccessEmail);

module.exports = router;
