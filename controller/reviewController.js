const Review = require('../model/reviewModel');
// const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/appError');

const factory = require('./handlerFactory');

//controllers
exports.getAllReview = factory.getAll(Review);

exports.setTourUserId = (req, res, next) => {
    //Allowing nested route
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id; //req.user will be from protect function
    next();
};

exports.getReview = factory.getOne(Review);

exports.createNewReview = factory.createOne(Review);

exports.updateReview = factory.updateOne(Review);

exports.deleteReview = factory.deleteOne(Review);
