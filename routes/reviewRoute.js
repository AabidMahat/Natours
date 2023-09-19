const express = require('express');
const reviewController = require('../controller/reviewController');
const athController = require('../controller/athController');

const router = express.Router({ mergeParams: true }); //the use of merge params is to get access to tourId which is the id of the tours nested url

router.use(athController.protect);

router
    .route('/')
    .get(reviewController.getAllReview)
    .post(
        athController.restrictTo('user'),
        reviewController.setTourUserId,
        reviewController.createNewReview
    );

router
    .route('/:id')
    .get(reviewController.getReview)
    .patch(
        athController.restrictTo('user', 'admin'),
        reviewController.updateReview
    )
    .delete(
        athController.restrictTo('user', 'admin'),
        reviewController.deleteReview
    );
module.exports = router;
