const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const Email = require('../utils/email');
const bcrypt = require('bcrypt');
// const showAlert = require('../js/alerts');

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    //Creating cookies with jwt token
    const cookieOption = {
        expires: new Date(
            Date.now() +
                process.env.JWT_COOKIE_EXPIRES_IN * (24 * 60 * 60 * 1000)
        ),
        httpOnly: true,
    };

    if (process.env.NODE_ENV === 'production') {
        cookieOption.secure = true;
    }
    res.cookie('jwt', token, cookieOption);

    //Remove the password from client
    user.password = undefined;

    // console.log(user);
    res.status(statusCode).json({
        status: statusCode,
        message: 'User logged In',
        token,
        data: {
            user,
        },
    });
};

//Checking purpose
exports.mailing = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);

    // const url = 'http://127.0.0.1:3000/account';
    const url = `${req.protocol}://${req.get('host')}/account`;
    console.log(url);
    await new Email(newUser, url).sendWelcome();

    next();
});

const signUpUser = new Map();
exports.signUp = catchAsync(async (req, res, next) => {
    const verificationToken = signToken(req.body.name);
    signUpUser
        .set('name', req.body.name)
        .set('email', req.body.email)
        .set('password', req.body.password)
        .set('confirmPassword', req.body.confirmPassword)
        .set('verificationToken', verificationToken)
        .set('emailVerified', false)
        .set('role', req.body.role);

    // // const url = 'http://127.0.0.1:3000/account';
    // const url = `${req.protocol}://${req.get('host')}/account`;
    // console.log(url);
    // await new Email(newUser, url).sendWelcome();
    // const message = `
    //     <p>Please click the button below to verify your email:</p>
    //     <a href="http://127.0.0.1:3000/api/v1/user/verifyEmail/${verificationToken}">
    //       <button>Verify Email</button>
    //     </a>
    //   `;
    try {
        // await sendEmail({
        //     email: req.body.email,
        //     subject: 'Verification of Email Address',
        //     message,
        // });

        const url = `http://127.0.0.1:3000/api/v1/user/verifyEmail/${verificationToken}`;

        await new Email(signUpUser.get('email'), url).sendWelcome();
        res.status(200).json({
            status: 'Success',
            message: 'Mail send to your inbox',
        });
    } catch (err) {
        return next(
            new AppError(
                'Cannot send the mail due to some internal errors !!',
                500
            )
        );
    }
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
    const verifyToken = req.params.token;
    // console.log(verifyToken, signUpUser.get('verificationToken'));
    if (verifyToken === signUpUser.get('verificationToken')) {
        await User.create({
            name: signUpUser.get('name'),
            email: signUpUser.get('email'),
            password: signUpUser.get('password'),
            confirmPassword: signUpUser.get('confirmPassword'),
            role: signUpUser.get('role'),
            emailVerified: true,
        });

        res.status(200).redirect('/logIn');
        // res.status(200).render('overview');
        // showAlert('success', 'Email Verified Successfully');
    } else {
        res.status(400).json({
            status: 'failed',
            message: 'Verification Failed , Please try again',
        });
    }
    // to clear the stored value;
    signUpUser.clear();
});

exports.logIn = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    // console.log(email);
    if (!email || !password) {
        return next(new AppError('Please enter email and password', 400));
    }
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password ', 401));
    }
    createSendToken(user, 200, res);
});

exports.logOut = (req, res) => {
    res.cookie('jwt', 'loggedOut', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(200).json({
        status: 'Success',
    });
};

//protecting get all tour
exports.protect = catchAsync(async (req, res, next) => {
    let token;
    // 1) Getting the token check the token if it's exists
    res.setHeader('Content-Type', 'application/javascript');

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
        // console.log(token);
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return next(
            new AppError(
                'You are not logged in ! Please login to get access ',
                401
            )
        );
    }
    // 2) Verification token

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // console.log(decoded);

    //3) Check if user still exists

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(
            new AppError(
                'The user belonging the token no longer exists!! ',
                401
            )
        );
    }

    //4) Check if user changed password after token was issued

    if (currentUser.changePasswordAfter(decoded.iat)) {
        return next(
            new AppError(
                'User have currently changed the password enter the new one',
                401
            )
        );
    }
    //Grant access to the protected route

    req.user = currentUser;
    res.locals.user = currentUser;
    next();
});
exports.isLogin = async (req, res, next) => {
    // 1) Getting the token check the token if it's exists

    if (req.cookies.jwt) {
        try {
            const decoded = await promisify(jwt.verify)(
                req.cookies.jwt,
                process.env.JWT_SECRET
            );

            //3) Check if user still exists

            const currentUser = await User.findById(decoded.id);
            if (!currentUser) {
                return next();
            }

            //4) Check if user changed password after token was issued

            if (currentUser.changePasswordAfter(decoded.iat)) {
                return next();
            }
            //Grant access to the protected route
            req.user = currentUser;

            res.locals.user = currentUser;
            return next();
        } catch (err) {
            return next();
        }
    }
    next();
};

exports.restrictTo =
    (...roles) =>
    (req, res, next) => {
        //roles is an array in this example its admin and lead-guide
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(
                    "U don't have permission to perform this role",
                    403
                )
            );
        }
        next();
    };
//Forget and reset the password

exports.forgetPassword = catchAsync(async (req, res, next) => {
    //1)Get user based on email id
    const currentUser = await User.findOne({
        email: req.body.email,
    });
    if (!currentUser) {
        return next(new AppError('No user found with this email address', 404));
    }

    //Generate random reset token;
    const resetToken = currentUser.createPasswordResetToken();

    await currentUser.save({ validateBeforeSave: false }); //Cuz we modify the document in userModel and we never save it so we save  here after performing the action

    //3) Send the mail

    try {
        const resetURL = `${req.protocol}://${req.get(
            'host'
        )}/api/v1/users/resetPassword/${resetToken}`;
        await new Email(currentUser, resetURL).sendPasswordReset();

        res.status(200).json({
            status: 'Success',
            message: 'Mail send to your inbox',
        });
    } catch (err) {
        currentUser.passwordResetToken = undefined;
        currentUser.passwordResetExpires = undefined;
        await currentUser.save({ validateBeforeSave: false }); //Cuz we modify the document in userModel and we never save it so we save  here after performing the action

        return next(
            new AppError('There is an error while sending an email', 500)
        );
    }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on token
    const hashToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const currentUser = await User.findOne({
        passwordResetToken: hashToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    // 2) Check if token is expired or not , user still exists,set a new password
    if (!currentUser) {
        return next(new AppError('Token is invalid or has expired! ', 400));
    }
    currentUser.password = req.body.password;
    currentUser.confirmPassword = req.body.confirmPassword;
    currentUser.passwordResetToken = undefined;
    currentUser.passwordResetExpires = undefined;

    await currentUser.save({ validateBeforeSave: true });

    //3) Update the changedPasswordAt property of user

    //4) LogIn the user ,send JWT
    createSendToken(currentUser, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) Get the user from collection
    console.log(req.user);
    const currentUser = await User.findById(req.user.id).select('+password');

    // 2) If he provides the valid password or not

    const enterPassword = req.body.passwordCurrent;
    console.log(enterPassword);
    if (
        !(await currentUser.correctPassword(
            enterPassword,
            currentUser.password
        ))
    ) {
        return next(
            new AppError('User not found please check ur password', 401)
        );
    }

    //3)update the password

    currentUser.password = req.body.password;
    currentUser.confirmPassword = req.body.confirmPassword;
    await currentUser.save();

    //4) Login the user send the jwt token
    createSendToken(currentUser, 200, res);
});
