require("dotenv").config();

module.exports = {
    mongo_url: process.env.MONGODB_URI,
    jwt_key: process.env.jwt_key
};

