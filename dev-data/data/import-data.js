const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../model/tourModel');
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

const tour = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));

//import data into database;
const importData = async () => {
    try {
        await Tour.create(tour);
        console.log('Data already loaded');
    } catch (err) {
        console.log(err.message);
    }
    process.exit();
};

//Delete all data from database;

const deleteData = async () => {
    try {
        await Tour.deleteMany({});
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
