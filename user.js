const fs = require('fs');
const express = require('express');

const app = express();

//MiddleWare
app.use(express.json());

//1) Reading user.json file

const user = JSON.parse(
    fs.readFileSync(`${__dirname}/dev-data/data/users.json`, 'utf-8')
);
// console.log(user);

//2) handling routes

const getAllUser = (req, res) => {
    res.status(200).json({
        status: 'success',
        users: user.length,
        data: {
            user,
        },
    });
};

const createNewUser = (req, res) => {
    const newUser = Object.assign(req.body);
    user.push(newUser);

    fs.writeFile(
        `${__dirname}/dev-data/data/users.json`,
        JSON.stringify(user),
        (err) => {
            if (err) throw err;
            res.status(201).send({
                status: 'success',
                users: user.length,
                data: {
                    newUser,
                },
            });
        }
    );
};

const findUser = (req, res) => {
    let id = req.params._id;

    const fetchUser = user.find((el) => el._id === id);

    if (!fetchUser) {
        res.status(404).json({
            status: 'failed',
            message: 'Invalid Id',
        });
    } else {
        res.status(202).json({
            status: 'Success',
            data: {
                fetchUser,
            },
        });
    }
};

const updateUser = (req, res) => {
    const id = req.params._id;

    const fetchUser = user.find((el) => el._id == id);

    if (!fetchUser) {
        res.status(404).json({
            status: 'failed',
            message: 'Invalid Id',
        });
    } else {
        fetchUser.name = `Anis Mahat`;
        fetchUser.email = `aabidmahat72@gmail.com`;

        res.status(202).json({
            status: 'Success',
            data: {
                fetchUser,
            },
        });
    }
};

const deleteUser = (req, res) => {
    const id = req.params._id;

    const fetchUser = user.find((el) => el._id == id);

    if (!fetchUser) {
        res.status(404).json({
            status: 'failed',
            message: 'Invalid ID',
        });
    } else {
        delete user['_id'];

        res.status(204).json({
            status: 'Success',
            message: 'SuccessFully Deleted',
        });
    }
};

//3)Routes
app.route('/api/v1/user').get(getAllUser).post(createNewUser);

app.route('/api/v1/user/:_id')
    .get(findUser)
    .patch(updateUser)
    .delete(deleteUser);

//4) creating a server;
const port = 3100;
app.listen(port, () => {
    console.log(`Running on port ${port}`);
});
