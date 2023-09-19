const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Review = require('./../../model/reviewModel');
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE_CONN_STR;
mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('DB connection successful');
    })
    .catch((err) => {
        console.log(err);
    });

//Read json file

const reviews = JSON.parse(
    fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

//import data into database;
const importData = async () => {
    try {
        await Review.create(reviews);
        console.log('Data already loaded');
    } catch (err) {
        console.log(err.message);
    }
    process.exit();
};

//Delete all data from database;

const deleteData = async () => {
    try {
        await Review.deleteMany({});
        console.log('Data deleted Successfully');
    } catch (err) {
        console.log(err.message);
    }
    process.exit();
};

if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteData();
}

console.log(process.argv);
