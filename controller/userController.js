const multer = require('multer');
const sharp = require('sharp');

const catchAsync = require('../utils/catchAsync');
const User = require('../model/userModel');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/user');
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//     },
// });

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

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .resize(500, 600)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`);

    next();
});

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el)) {
            newObj[el] = obj[el];
        }
    });
    return newObj;
};

//Handling MiddleWare to get all admins
exports.aliasGuide = (req, res, next) => {
    req.query.sort = 'name';
    req.query.role = 'guide';
    req.query.field = 'name,email,role,photo';
    next();
};
//1) handling routes

//Adding a/me endpoints
exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
    console.log(req.file);
    console.log(req.body);
    // 1) create error if user POSTs passwords data
    if (req.body.password || req.body.confirmPassword)
        return next(
            new AppError(
                'This route is not for password Update. Please use /updatePassword',
                404
            )
        );
    // 2) Filter out the data which is private

    const filterBody = filterObj(req.body, 'name', 'email');
    if (req.file) filterBody.photo = req.file.filename;
    // 3) Update User document
    const updateUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        status: 'success',
        message: 'Data modified',
        data: {
            user: updateUser,
        },
    });
});
exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, {
        active: false,
    });
    res.status(200).json({
        status: 'Success',
        message: 'User data has been removed',
    });
});
exports.getAllUser = factory.getAll(User);

exports.createNewUser = factory.createOne(User);

exports.findUser = factory.getOne(User);

exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);
