const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIfeatures = require('../utils/TourAPI-Features');
//Demo Template

exports.deleteOne = (Model) =>
    catchAsync(async (req, res, next) => {
        //In rest full api we don't send any data while deleting
        const doc = await Model.findByIdAndDelete(req.params.id);

        if (!doc) {
            return next(new AppError('No doc found with that id', 404));
        }
        res.status(204).json({
            status: 'success',
            message: 'Operation performed successfully',
        });
    });

exports.updateOne = (Model) =>
    catchAsync(async (req, res, next) => {
        console.log(req.params.id);
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        console.log(doc);
        if (!doc) {
            return next(new AppError('No document found with that id', 404));
        }
        res.status(200).json({
            status: 'success',
            data: {
                doc,
            },
        });
    });

exports.createOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.create(req.body);

        res.status(201).send({
            status: 'success',
            data: {
                Model: doc,
            },
        });
    });

exports.getOne = (Model, popOptions) =>
    catchAsync(async (req, res, next) => {
        const query = Model.findById(req.params.id);
        if (popOptions) query.populate(popOptions); // Use for child referencing //to fill up the guides part using populate

        const doc = await query;

        //Tour.findOne({'_id':req.params.id})

        if (!doc) {
            return next(new AppError('No tour found with that id', 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                doc,
            },
        });
    });

exports.getAll = (Model) =>
    catchAsync(async (req, res, next) => {
        //to allow for nested GET review on Tour(hack)
        let filtering = {};
        if (req.params.tourId) filtering = { tour: req.params.tourId };

        const features = new APIfeatures(Model.find(filtering), req.query)
            .filter()
            .sort()
            .limitField()
            .paginate();
        const doc = await features.query;
        res.status(200).json({
            status: 'success',
            requestedAt: req.requestTime,
            result: doc.length,
            data: {
                doc,
            },
        });
    });
