const express = require('express');
const tourController = require('../controller/tourController');
const authController = require('../controller/athController');
// const reviewController = require('../controller/reviewController');
const reviewRoute = require('./reviewRoute');

//we can use destructing of an object;
// const {
//   getAllTour,
//   createNewTour,
//   getTour,
//   updateTour,
//   deleteTour,
// } = require('./../controller/tourController');

const router = express.Router();

//new way of nesting route;
router.use('/:tourId/reviews', reviewRoute);

// router.param('id', tourController.checkID);
//middleware to get top 5 cheap and high rated tours;
router
    .route('/top-5-cheapTours')
    .get(tourController.aliasTopTour, tourController.getAllTour);

router.route('/tour-stats').get(tourController.getTourStats);
router
    .route('/monthly-plan/:year')
    .get(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide', 'guide'),
        tourController.monthlyPlan
    );

// Geospatical route

router.get(
    '/tours-within/:distance/center/:latlng/:unit',
    tourController.getTourWithIn
);

//To calculate the distance of tour guide from user
router.route('/distance/:latlng/unit/:unit').get(tourController.getDistances);
//*********************************************************************** */

router
    .route('/')
    .get(tourController.getAllTour)
    .post(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.createNewTour
    ); //as we are already at ('/api/v1/tours') as we are using tourRoute so we need specify has root

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.uploadTourImages,
        tourController.resizeTourImages,
        tourController.updateTour
    )
    .delete(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.deleteTour
    );

//Old Fashioned way of nesting route ;
// router
//     .route('/:tourId/reviews')
//     .post(
//         authController.protect,
//         authController.restrictTo('user'),
//         reviewController.createNewReview
//     );
module.exports = router;
