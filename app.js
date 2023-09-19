const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const tourRouter = require('./routes/tourRoute');
const user = require('./routes/userRoute');
const review = require('./routes/reviewRoute');
const booking = require('./routes/bookingRoute');
const views = require('./routes/viewRoute');
const AppError = require('./utils/appError');

const cookieParser = require('cookie-parser');

const globalErrorHandler = require('./controller/errorController');

const app = express();

//Setting up pug

// Set a CSP header that allows scripts from 'self' and the CDN

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
//Morgan (3rd party middleware)
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
//Set security http header
app.use(helmet());

//Limit request from same api

const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many request from this IP,please try again after a hour',
});
app.use('/api', limiter);

//1)middleware
//middleware is used to access the req.body part in post method or while creating a new tour

//Body parser , reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
// Data Sanitization against No SQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS

app.use(xss());

//Prevent parameter pollution

app.use(
    hpp({
        whitelist: ['duration'],
    })
);

//Reading the static files
app.use(express.static(`${__dirname}/public`));
// app.use(express.static(`${__dirname}/dev-data`));

//creating ur own middleware

app.use((req, res, next) => {
    console.log('Hello from middle ware 👋');
    next();
});

//manipulating request part

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    console.log(req.cookies);
    next();
});

//working with json ;

//2) ROUTE HANDLERS

//************************************** Simple Method ********************** */
// //get method;
// app.get('/api/v1/tours', allTour);

// //post method

// app.post('/api/v1/tours', addTour);

// //parameter request;
// // '/api/v1/tours/:id/:name?'//optional parameter is done using ?;
// app.get('/api/v1/tours/:id', getTour);

// //patch method

// app.patch('/api/v1/tours/:id', updateTour);

// //delete method

// app.delete('/api/v1/tours/:id', deleteTour);

//**************************************************************************** */

//other way to format the route is to use route method;

//3)Routes

app.use('/', views);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/user', user);
app.use('/api/v1/reviews', review);
app.use('/api/v1/bookings', booking);
//app.route('/api/v1/tours') initially

//Before creating appError class
// app.all('*', (req, res, next) => {
//     // res.status(404).json({
//     //     status: 'failed',
//     //     message: `Can't find ${req.originalUrl} on this server`,
//     // });
//     // next();
//     // const err = new Error(`Can't find ${req.originalUrl} on this server`);
//     // err.status = 'failed';
//     // err.statusCode = 404;
//     // next(err); //whenever we pass an argument to the next() it will automatically determine its an error and it will skip all the middleware and goes to the global error handling middleware

//     next(new appError(`Can't find ${req.originalUrl} on this server`, 404));
// });

//After creating appError Class

app.all('*', (req, res, next) =>
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404))
);

//Error handling

app.use(globalErrorHandler);

module.exports = app;
