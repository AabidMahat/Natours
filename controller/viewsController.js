const Tour = require('../model/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../model/userModel');
const Booking = require('../model/bookingModel');
exports.getOverview = catchAsync(async (req, res, next) => {
    const tours = await Tour.find();

    res.status(200).render('overview', {
        tours,
    });
});
exports.getTourData = catchAsync(async (req, res, next) => {
    // 1) find the specific data
    const tour = await Tour.findOne({
        slugify: req.params.slugify,
    }).populate({
        path: 'reviews',
        select: 'review rating user',
    });

    // 2)
    if (!tour) {
        return next(new AppError('There is no tour with that name.', 404));
    }

    res.status(200).render('tour', {
        title: tour.name,
        tour,
    });
});
exports.basePage = (req, res) => {
    res.status(200).render('base', {
        tours: 'The Forest Hiker',
        user: 'Anis',
    });
};

exports.logInUser = catchAsync(async (req, res, next) => {
    res.status(200).render('logIn', {
        title: 'Login Page',
    });
});
exports.getAccount = catchAsync((req, res, next) => {
    res.status(200).render('account', {
        title: 'Account Page',
    });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
    // console.log(req.user);
    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        {
            name: req.body.name,
            email: req.body.email,
        },
        {
            new: true,
            runValidators: true,
        }
    );
    res.status(200).render('account', {
        title: 'Account Page',
        user: updatedUser,
    });
});

exports.signUp = (req, res, next) => {
    res.status(200).render('signUp', {
        title: 'Create New Account',
    });
};

exports.getMyTour = catchAsync(async (req, res, next) => {
    // 1) Find all Bookings
    const booking = await Booking.find({ user: req.user.id });

    //2) FInd tours with the returned IDs

    const tourIds = booking.map((el) => el.tour);

    const tours = await Tour.find({
        _id: {
            $in: tourIds,
        },
    });
    res.status(200).render('overview', {
        title: 'My tours',
        tours,
    });
});
