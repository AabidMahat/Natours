const express = require('express');
const authController = require('../controller/athController');
const bookingController = require('../controller/bookingController');

const router = express.Router();

router.get(
    '/checkIn/:tourId',
    authController.isLogin,
    bookingController.getCheckoutSession
);
router.get(
    '/remove-tours/:tourId',
    authController.isLogin,
    bookingController.deleteCurrentBookings
);
module.exports = router;
