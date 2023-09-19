class APIfeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }
    filter() {
        //filtering;
        const queryObj = { ...this.queryString };
        const excludeData = ['sort', 'page', 'limit', 'field'];
        excludeData.forEach((el) => delete queryObj[el]);

        //Advance Filtering;
        // {active : true,}
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(
            /\b(gte|gt|lte|lt)\b/g,
            (match) => `$${match}`
        );

        this.query = this.query.find(JSON.parse(queryStr));

        return this;
    }
    sort() {
        //Sorting based on user png;
        if (this.queryString.sort) {
            const sortArray = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortArray);
        } else {
            this.query = this.query.sort('name');
        }
        return this;
    }
    limitField() {
        //fields specify only name email photo;

        if (this.queryString.field) {
            const fieldArray = this.queryString.field.split(',').join(' ');
            console.log(fieldArray);
            this.query = this.query.select(fieldArray);
        } else {
            this.query = this.query.select('-__v');
        }
        return this;
    }
    paginate() {
        //4)Pagination
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 23;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

module.exports = APIfeatures;
