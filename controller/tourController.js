const multer = require('multer');
const sharp = require('sharp');

const Tour = require('../model/tourModel');
const { query } = require('express');

const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');
//middleWare Part or implementation

const multerStorage = multer.memoryStorage();

//To check whether user upload image
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('You must upload an Image', 404), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});

//We are using upload.fields cuz we have multiple fields
// if we have single field then we would have used upload.array

exports.uploadTourImages = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 },
]);

//process the images
exports.resizeTourImages = catchAsync(async (req, res, next) => {
    //instead of file we use files cuz we have multiple data

    if (!req.files.imageCover || req.files.image) {
        return next();
    }

    // 1) Processing the cover image
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${req.body.imageCover}`);

    //2) Images
    req.body.images = [];
    await Promise.all(
        req.files.images.map(async (file, i) => {
            const filename = `tour-${req.params.id}-${Date.now()}-${
                i + 1
            }.jpeg`;

            await sharp(file.buffer)
                .resize(2000, 1333)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(`public/img/tours/${filename}`);

            req.body.images.push(filename);
        })
    );
    next();
});

exports.aliasTopTour = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,ratingsAverage,price,summary';
    next();
};

exports.getAllTour = factory.getAll(Tour);

exports.createNewTour = factory.createOne(Tour);

exports.getTour = factory.getOne(Tour, { path: 'reviews', select: -'__v' });

exports.updateTour = factory.updateOne(Tour);
// modify data;
exports.deleteTour = factory.deleteOne(Tour);

//Aggregations and pipelining

exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } },
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty' },
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
            },
        },
        {
            $project: {
                _id: 1,
                numTours: 1,
                numRatings: 1,
                avgRating: { $round: ['$avgRating', 1] },
                avgPrice: { $round: ['$avgPrice', 1] },
                minPrice: 1,
                maxPrice: 1,
            },
        },
        {
            $sort: {
                avgPrice: 1,
            },
        },
        // {
        //     $match: {
        //         _id: { $ne: 'EASY' },
        //     },
        // },
    ]);
    res.status(200).json({
        status: 'success',
        data: {
            stats,
        },
    });
});
exports.monthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;
    // console.log(year);
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates',
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`),
                },
            },
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numOfToursStart: { $sum: 1 },
                tours: { $push: '$name' },
            },
        },
        {
            $addFields: {
                month: '$_id',
            },
        },
        {
            $project: {
                _id: 0,
            },
        },
        {
            $sort: {
                numOfToursStart: -1,
            },
        },
        {
            $limit: 12,
        },
    ]);
    res.status(200).json({
        status: 'success',
        length: plan.length,
        data: {
            plan,
        },
    });
});

exports.getTourWithIn = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;

    //getting lat , lng
    const [lat, lng] = latlng.split(',');

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lng) {
        next(new AppError('Please provide latitude and longitude ', 404));
    }

    const tours = await Tour.find({
        startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
    });

    res.status(400).json({
        status: 'Success',
        results: tours.length,
        data: {
            data: tours,
        },
    });
});

exports.getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;

    //Fetching lat and lng
    const [lat, lng] = latlng.split(',');

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if (!lat || !lng) {
        next(new AppError('Please provide latitude and longitude ', 404));
    }

    //To calculate distance we use aggregate pipeline
    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: String,
                    coordinates: [lng * 1, lat * 1],
                },
                distanceField: 'Distance',
                distanceMultiplier: multiplier,
            },
        },
        {
            $project: {
                Distance: {
                    $round: ['$Distance', 2],
                },
                name: 1,
            },
        },
    ]);
    res.status(400).json({
        status: 'Success',
        data: {
            data: distances,
        },
    });
});
