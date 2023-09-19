// ****************************************FOR TOURS*************************************************
// 1A) Filtering
//         const queryObj = { ...req.query };
//         const excludeData = ['page', 'sort', 'limit', 'fields'];

//         excludeData.forEach((el) => delete queryObj[el]);

//         //1B)Advance Filtering:
//         // {difficulty :"easy" , duration :{$gte : 5}}
//         // {difficulty :"easy" , duration :{gte : 5}}
//         //gte=>gt ,lte=>le
//         let queryStr = JSON.stringify(queryObj);
//         queryStr = queryStr.replace(
//             /\b(gte|gt|lte|le)\b/g,
//             (match) => `$${match}`
//         ); //regular expression is used to replace the multiple operator , the reason we use call back function cuz there are multiple variable to replace

//         // console.log(JSON.parse(queryStr)); //JSON.parse is use to convert string back to object

//         let query = Tour.find(JSON.parse(queryStr));

//         // 2) Sort
//         // console.log(req.query.sort);
//         if (req.query.sort) {
//             const sortBy = req.query.sort.split(',').join(' ');
//             //(price maxGroupSize)
//             query = query.sort(sortBy);
//         } else {
//             query = query.sort('-createdAt');
//         }

//         //3)Field Limiting

//         if (req.query.fields) {
//             const fieldArray = req.query.fields.split(',').join(' ');
//             query = query.select(fieldArray); //select method is used  to select the specific part of object which accepts string like ('name' 'surName' 'lastName')
//         } else {
//             query = query.select('-__v'); // -__v we exclude the __v
//         }

//         //4 Pagination

//         const page = req.query.page * 1 || 1;
//         const limit = req.query.limit * 1 || 10;
//         const skip = (page - 1) * limit;
//         query = query.skip(skip).limit(limit); //syntax of pagination

//         if (req.query.page) {
//             console.log('Welcome Homie');
//             const numTour = await Tour.countDocuments();
//             if (skip >= numTour) throw new Error("This page doesn't exsist");
//         }
//*************************************************************************************************************************** */

//**********************************************FOR USER******************************************************************* */
// //filtering;
// const queryObj = { ...req.query };
// const excludeData = ['sort', 'page', 'limit', 'field'];
// excludeData.forEach((el) => delete queryObj[el]);

// //Advance Filtering;
// // {active : true,}
// let queryStr = JSON.stringify(queryObj);
// queryStr = queryStr.replace(
//     /\b(gte|gt|lte|lt)\b/g,
//     (match) => `$${match}`
// );

// let query = User.find(JSON.parse(queryStr));

// //Sorting based on user png;
// if (req.query.sort) {
//     const sortArray = req.query.sort.split(',').join(' ');
//     query = query.sort(sortArray);
// } else {
//     query = query.sort('name');
// }
// //fields specify only name email photo;

// if (req.query.field) {
//     const fieldArray = req.query.field.split(',').join(' ');
//     console.log(fieldArray);
//     query = query.select(fieldArray);
// } else {
//     query = query.select('-__v');
// }
// //4)Pagination
// const page = req.query.page * 1 || 1;
// const limit = req.query.limit * 1 || 10;
// const skip = (page - 1) * limit;

// query = query.skip(skip).limit(limit);
// //Invalid Page

// if (req.query.page) {
//     const numUser = await User.countDocuments();
//     if (skip >= numUser) throw new Error("This page doesn't Exist");
// }
//*************************************************************************************************************************** */
