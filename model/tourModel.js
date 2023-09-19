const mongoose = require('mongoose');
const slugify = require('slugify');
//3rd party validator
const validator = require('validator');
const User = require('./userModel');
//creating a simple schema
//Schema has two parts 1) defination and options
const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A tour must have a name'], //[display ,error message]
            unique: true,
            trim: true,
            maxlength: [40, 'Tour name must have less or equal to 40 char'],
            minlength: [10, 'Tour name must have more or equal to 10 char'],
            // validate: [validator.isAlpha, 'Name must contains only characters'],
        },
        slugify: String,
        duration: {
            type: String,
            required: [true, 'A tour must have duration'],
        },
        maxGroupSize: {
            type: Number,
            required: [true, 'A Tour must have a group size'],
        },
        difficulty: {
            type: String,
            required: [true, 'A Tour must have a difficulty'],
            enum: {
                values: ['easy', 'medium', 'difficult'],
                message: 'Difficulty is either : easy, medium or difficult',
            },
        },
        price: {
            type: Number,
            required: [true, 'A tour must pay price'],
        },
        priceDiscount: {
            type: Number,
            validate: {
                validator: function (value) {
                    //this keyword is only available when creating new documents its not available to update documents
                    return value < this.price;
                },
                message:
                    'Discount price ({VALUE}) should be below regular price',
            },
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, 'Rating must be above 0.0'],
            max: [5, 'Rating must be less than 5.0'],
            set: (val) => Math.round(val * 10) / 10, // To round the average
        },
        discount: {
            type: Number,
        },
        summary: {
            type: String,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        imageCover: {
            type: String,
            required: [true, 'A tour must have a cover image'],
        },
        images: [String],

        createdAt: {
            type: Date,
            default: Date.now(),
            select: false, //as we don't want to display it to the client/user
        },
        startDates: [Date],

        secretTour: {
            type: Boolean,
            default: false,
        },
        startLocation: {
            type: {
                type: String,
                default: 'Point',
                enum: {
                    values: ['Point'],
                    message: 'Value can only be Point',
                },
            },
            coordinates: [Number],
            address: String,
            description: String,
        },
        locations: [
            {
                type: {
                    type: String,
                    default: 'Point',
                    enum: {
                        values: ['Point'],
                        message: 'Value can only be Point',
                    },
                },
                coordinates: [Number],
                address: String,
                description: String,
                day: Number,
            },
        ],
        //Chid Referencing
        guides: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
            },
        ],
    },
    {
        toJSON: {
            virtuals: true,
        },
        toObject: {
            virtuals: true,
        },
    }
);

tourSchema.index({
    price: 1,
    ratingsAverage: -1,
});
//fOR SLUGS
tourSchema.index({
    slug: 1,
});

//geospacial index

tourSchema.index({ startLocation: '2dsphere' });

// tourSchema.index({
//     price: 1,
// });

//Virtual element

tourSchema.virtual('durationWeeks').get(function () {
    return this.duration >= 7 ? (this.duration / 7).toFixed(1) : this.duration;
});

//implementing virtual property to connect review model and tour model

tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id',
});

// DOCUMENT MIDDLEWARE :- WORKS ONLY ON SAVE() AND CREATE() CALL
tourSchema.pre('save', function (next) {
    this.slugify = slugify(this.name, { lower: true });
    next();
});

tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v -emailVerified', // use to remove specific field especially when we use (-) sign
    });
    next();
});

// tourSchema.pre('save', async function (next) {
//     const guidesPromise = this.guides.map(
//         async (id) => await User.findById(id)
//     );
//     this.guides = await Promise.all(guidesPromise);
//     next();
// });
// tourSchema.post('save', function (doc, next) {
//     console.log(doc);
//     next();
// });

// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
    // ^find (captures all the find method thats start with find for eg findOne ,findMany)
    this.find({ secretTour: { $ne: true } }); //filter Method
    next();
});

//AGGREGATION MIDDLEWARE;
// tourSchema.pre('aggregate', function (next) {
//     this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//     console.log(this.pipeline());
//     next();
// });

//create a model
const Tour = mongoose.model('Tour', tourSchema);

// const testTour = new Tour({
//   name: 'The Park Camper',
//   price: 297,
// });

// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

module.exports = Tour;
