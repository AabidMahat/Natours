const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewsSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, 'User must enter the review'],
        },
        rating: {
            type: Number,
            required: [true, 'user must enter the rating'],
            min: [1, 'Rating cannot be less than 1'],
            max: [5, 'Rating cannot be greater than 5'],
        },
        createdAt: {
            type: Date,
            default: Date.now(),
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'User must enter the review'],
        },

        tour: {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'Review must belong to Tour'],
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

//middleWare function for populating the route

reviewsSchema.index(
    {
        tour: 1,
        user: 1,
    },
    {
        unique: true,
    }
);

reviewsSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name photo',
    });
    // this.populate({
    //     path: 'user',
    //     select: 'name',
    // }).populate({
    //     path: 'tour',
    //     select: 'name images',
    // });

    next();
});

reviewsSchema.statics.calcAverageRatings = async function (tourID) {
    console.log(tourID);
    const stats = await this.aggregate([
        {
            $match: { tour: tourID },
        },
        {
            $group: {
                _id: '$tour',
                numRating: { $sum: 1 },
                avgRating: { $avg: '$rating' },
            },
        },
    ]);
    // console.log(stats);

    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourID, {
            ratingsQuantity: stats[0].numRating,
            ratingsAverage: stats[0].avgRating,
        });
    } else {
        await Tour.findByIdAndUpdate(tourID, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5,
        });
    }
};
reviewsSchema.post('save', function () {
    //This points to current review

    this.constructor.calcAverageRatings(this.tour);
});

//Updating the avgReview when user update and delete review

reviewsSchema.pre(/^findOneAnd/, async function (next) {
    this.reviewSave = await this.findOne();
    next();
});
reviewsSchema.post(/^findOneAnd/, async function () {
    //await this.findOne() will not work as query is already being executed
    await this.reviewSave.constructor.calcAverageRatings(this.reviewSave.tour);
});

const Review = mongoose.model('Review', reviewsSchema);

module.exports = Review;
