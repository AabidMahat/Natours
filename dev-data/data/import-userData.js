const fs = require('fs');
const mongoose = require('mongoose');
const User = require('./../../model/userModel');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

//Read the user.json file

const DB = process.env.DATABASE_CONN_STR;
//import Data

mongoose
    .connect(DB, {
        useCreateIndex: true,
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('DB is connected successfully');
    });
const user = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

const importData = async () => {
    try {
        await User.create(user);
        console.log('Data entered Successfully');
    } catch (err) {
        console.log(err.message);
    }
    process.exit();
};

//Delete exisiting data;

const deleteData = async () => {
    try {
        await User.deleteMany({});
        console.log('Data Deleted successfully');
    } catch (err) {
        console.log(err.message);
    }
    process.exit();
};

// deleteData();
// importData();
if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteData();
}
console.log(process.argv);
