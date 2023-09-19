const express = require('express');
const userController = require('../controller/userController');
const athController = require('../controller/athController');
// const reviewController = require('../controller/reviewController');
// const User = require('../model/userModel');

const router = express.Router();

//MiddleWare route to find all admins

// router.post('/signUp', athController.mailing);
router.post('/signUp', athController.signUp);
router.get('/verifyEmail/:token', athController.verifyEmail);
router.post('/logIn', athController.logIn);
router.get('/logOut', athController.logOut);
//Forget and reset password

router.post('/forgetPassword', athController.forgetPassword);
router.patch('/resetPassword/:token', athController.resetPassword);

//Middlewares runs in sequence so  in order to protect all the above route
router.use(athController.protect);

router.patch('/updatePassword', athController.updatePassword);

//Adding a/me endpoints
router.route('/me').get(userController.getMe, userController.findUser);

router.delete('/deleteUser', userController.deleteMe);

router
    .route('/allGuide')
    .get(userController.aliasGuide, userController.getAllUser);

router.patch(
    '/updateMe',
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateMe
);

//Restricting the route to only user
router.use(athController.restrictTo('admin'));

router
    .route('/')
    .get(userController.getAllUser)
    .post(userController.createNewUser);

router
    .route('/:_id')
    .get(userController.findUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

//Nested route

module.exports = router;
