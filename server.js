const mongoose = require('mongoose');
const dotenv = require('dotenv');

//Handles all unhandled exceptions
process.on('uncaughtException', (err) => {
    console.log(err.name, err.message);
    console.log('UNHANDLED Exception!💥SHUTTING DOWN');
    process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

// console.log(app.get('env'));

//node js enviroment
// console.log(process.env);

//connection;
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
    });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}`);
});
console.log(process.env.NODE_ENV);
//Handles all unhandled errors
process.on('unhandledRejection', (err) => {
    console.log(err.name, err.message);
    console.log('UNHANDLED REJECTION!💥SHUTTING DOWN');
    server.close(() => {
        process.exit(1);
    });
});
