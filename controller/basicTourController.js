const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8')
);

exports.checkID = (req, res, next, val) => {
  console.log(`Tour's id = ${val}`);
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'failed',
      message: 'Invalid ID',
    });
  }
  next();
};

exports.checkCredential = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(404).json({
      status: 'failed',
      message: 'Incomplete Credential',
    });
  }
  next();
};

exports.getAllTour = (req, res) => {
  console.log(req.requestTime);
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    result: tours.length,
    data: {
      tours,
    },
  });
};

exports.createNewTour = (req, res) => {
  // console.log(req.body);
  // res.send('Done');

  //fetch the last id ;
  const newId = tours[tours.length - 1].id + 1;

  //create new tour
  const newTour = Object.assign({ id: newId }, req.body);

  //add new tour to the tours array;
  tours.push(newTour);

  //overwrite the tours-simple.json file with new tours;
  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).send({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
};

exports.getTour = (req, res) => {
  console.log(req.params);

  //as data is in type string we need to convert it into number
  const id = req.params.id * 1;

  //to find the required id from tours array using find method
  const fetchTour = tours.find((el) => el.id == id);

  // f (id > tours.length)
  if (!fetchTour) {
    return res.status(404).json({
      status: 'failed',
      message: 'Invalid ID',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      fetchTour,
    },
  });
};

exports.updateTour = (req, res) => {
  const id = req.params.id * 1;
  const fetchTour = tours.find((el) => el.id === id);
  // console.log(fetchTour);

  console.log(fetchTour);
  fetchTour.name = 'Aabid Mahat';
  fetchTour.duration = '20 days';
  tours.splice(id, 1);
  tours.push(fetchTour);
  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(200).json({
        status: 'success',
        data: {
          fetchTour,
        },
      });
    }
  );
};
// modify data;

exports.deleteTour = (req, res) => {
  let id = req.params.id * 1;
  const fetchTour = tours.find((el) => el.id === id);

  if (!fetchTour) {
    return res.status(404).json({
      status: 'Failed',
      message: 'Invalid ID',
    });
  }
  //delete keyword is use to delete data from object the problem with delete keyword it create null pointer at the end of the file
  //delete tours[id];
  tours.splice(id, 1);
  id--;
  // fs.writeFile(`${__dirname}/dev-data/data/AnotherTours-simple.json`);
  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(204).json({
        status: 'success',
        message: 'Operation performed successfully',
        data: {
          fetchTour,
        },
      });
    }
  );
};
