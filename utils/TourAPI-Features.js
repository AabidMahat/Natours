class apiFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }
    filter() {
        const queryObj = { ...this.queryString };
        const excludeData = ['page', 'sort', 'limit', 'fields'];

        excludeData.forEach((el) => delete queryObj[el]);

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(
            /\b(gte|gt|lte|le)\b/g,
            (match) => `$${match}`
        );
        this.query = this.query.find(JSON.parse(queryStr));

        return this;
    }
    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            //(price maxGroupSize)
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }
    limitField() {
        if (this.queryString.fields) {
            const fieldArray = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fieldArray); //select method is used  to select the specific part of object which accepts string like ('name' 'surName' 'lastName')
        } else {
            this.query = this.query.select('-__v'); // -__v we exclude the __v
        }
        return this;
    }
    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 15;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit); //syntax of pagination

        return this;
    }
}

module.exports = apiFeatures;
