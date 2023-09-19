const fs = require('fs');

const user = JSON.parse(
    fs.readFileSync(`${__dirname}/../dev-data/data/users.json`, 'utf-8')
);
// console.log(user);

//2) handling routes

exports.checkID = (req, res, next, val) => {
    const findMyID = user.find((data) => data._id === req.params._id);
    console.log(`Tour's id = ${val}`);
    if (!findMyID) {
        return res.status(404).json({
            status: 'failed',
            message: 'Invalid Id',
        });
    }
    next();
};

exports.getAllUser = (req, res) => {
    res.status(200).json({
        status: 'success',
        users: user.length,
        data: {
            user,
        },
    });
};

exports.createNewUser = (req, res) => {
    const newUser = Object.assign(req.body);
    user.push(newUser);

    fs.writeFile(
        `${__dirname}/../dev-data/data/users.json`,
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

exports.findUser = (req, res) => {
    const id = req.params._id;

    const fetchUser = user.find((el) => el._id === id);

    res.status(202).json({
        status: 'Success',
        data: {
            fetchUser,
        },
    });
};

exports.updateUser = (req, res) => {
    const id = req.params._id;

    const fetchUser = user.find((el) => el._id == id);

    fetchUser.name = `Aabid Mahat`;
    fetchUser.email = `aabidmahat72@gmail.com`;
    user.splice(id, 1);
    user.push(fetchUser);

    fs.writeFile(
        `${__dirname}/../dev-data/data/users.json`,
        JSON.stringify(user),
        (err) => {
            if (err) {
                res.status(505).json({
                    status: 'Update Failed',
                    message: 'Server Error',
                });
            } else {
                res.status(202).json({
                    status: 'Success',
                    data: {
                        fetchUser,
                    },
                });
            }
        }
    );
};

exports.deleteUser = (req, res) => {
    let id = req.params._id;

    const fetchUser = user.find((el) => el._id == id);

    user.splice(id, 1);
    id--;

    fs.writeFile(
        `${__dirname}/../dev-data/data/users.json`,
        JSON.stringify(user),
        (err) => {
            if (err) {
                res.status(505).json({
                    status: 'Update Failed',
                    message: 'Server Error',
                });
            } else {
                res.status(204).json({
                    status: 'Success',
                    message: 'SuccessFully Deleted',
                });
            }
        }
    );
};
