const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
//creating a new schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'User must contain name'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'User must enter the email'],
        trim: true,
        toLowerCase: true,
        unique: true,
        validate: [validator.isEmail, 'Please enter a valid email'],
    },
    role: {
        type: String,
        enum: {
            values: ['user', 'guide', 'lead-guide', 'admin'],
            message: 'Invalid Input please enter correct input',
        },
        default: 'user',
    },
    photo: {
        type: String,
        default: 'user.gif',
    },

    password: {
        type: String,
        unique: true,
        minlength: 6,
        required: [true, 'User must enter the password'],
        select: false,
    },
    confirmPassword: {
        type: String,
        minlength: 6,
        required: [true, 'User must enter the password'],

        //This is only work on CREATE and SAVE!!!
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: 'Passwords are not the same',
        },
    },
    passwordChangeAt: {
        type: Date,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false,
    },
    verificationToken: String,
    emailVerified: {
        type: Boolean,
        default: false,
    },
});

//Encryption of password
userSchema.pre('save', async function (next) {
    //Only run the function if password is actually is modified
    if (!this.isModified('password')) return next();

    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // Delete the confirm password
    this.confirmPassword = undefined;
    next();
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangeAt = Date.now() - 1000; //we subtract 1s cuz sometimes saving date.now() in database might take longer time than generating the token
    next();
});

userSchema.pre(/^find/, function (next) {
    //this will point to current query
    this.find({ active: true });
    next();
});

userSchema.methods.correctPassword = async function (
    newPassword,
    currentPassword
) {
    return await bcrypt.compare(newPassword, currentPassword);
};

userSchema.methods.changePasswordAfter = function (JWTTimeStamp) {
    if (this.passwordChangeAt) {
        const changeTimeAt = parseInt(
            this.passwordChangeAt.getTime() / 1000,
            10
        );
        console.log(changeTimeAt, JWTTimeStamp);

        return JWTTimeStamp < changeTimeAt;
    }

    //false means not changed
    return false;
};

userSchema.methods.createPasswordResetToken = function () {
    //The reason we use crypto cuz we dont need an highly encoded string
    const resetToken = crypto.randomBytes(34).toString('hex');

    //encrypt the token
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    console.log({ resetToken }, this.passwordResetToken);
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    console.log(this.passwordResetExpires);
    return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
