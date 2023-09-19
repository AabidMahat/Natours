const express = require('express');
const athController = require('../controller/athController');

const viewsController = require('../controller/viewsController');
const bookingController = require('../controller/bookingController');

const router = express.Router();

// router.use();

router.get(
    '/',
    bookingController.createBookingCheckOut,
    athController.isLogin,
    viewsController.getOverview
);

router.get(
    '/tours/:slugify',
    athController.isLogin,
    viewsController.getTourData
);

router.get('/logIn', athController.isLogin, viewsController.logInUser);
router.get('/signUp', viewsController.signUp);
router.get('/verifyEmail/:token', athController.verifyEmail);

router.route('/account').get(athController.isLogin, viewsController.getAccount);

router.get('/my-tours', athController.isLogin, viewsController.getMyTour);

router.post(
    '/submit-user-data',
    athController.isLogin,
    viewsController.updateUserData
);

module.exports = router;
