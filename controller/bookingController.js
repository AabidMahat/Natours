const stripe = require('stripe')(process.env.STRIPE_SECERT_KEY);
const Tour = require('../model/tourModel');
const Booking = require('../model/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { ids } = require('webpack');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    //1) Get currently booking tour
    const tour = await Tour.findById(req.params.tourId);
    // console.log(tour)
    //2) CREATE THE CHECKOUT SESSION
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/?tour=${
            req.params.tourId
        }&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slugify}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,

        line_items: [
            {
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: `${tour.name} Tour`,
                        description: tour.summary,
                        images: [
                            `https://www.natours.dev/img/tours/${tour.imageCover}`,
                        ],
                    },
                    unit_amount: tour.price * 100 * 80,
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
    });

    res.status(200).json({
        status: 'success',
        session,
    });
});

exports.createBookingCheckOut = catchAsync(async (req, res, next) => {
    //This is only temporary .. because everyone can make booking without paying
    const { tour, user, price } = req.query;

    if (!tour && !user && !price) {
        return next();
    }
    await Booking.create({ tour, user, price });

    res.redirect(req.originalUrl.split('?')[0]);
});

exports.deleteCurrentBookings = catchAsync(async (req, res, next) => {
    const bookedTour = req.params.tourId;

    const bookings = await Booking.findOne({
        user: req.user.id,
        tour: bookedTour,
    });

    // Check if a booking exists for the specified tour
    if (!bookings) {
        return next(new AppError('No Booking for that tour', 404));
    }
    console.log(bookings);

    await bookings.remove();
    res.status(200).json({
        status: 'Success',
        message: 'Booking removed successfully',
    });
});
