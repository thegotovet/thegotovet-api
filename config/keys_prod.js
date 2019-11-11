require("dotenv").config();

module.exports = {
    mongo_url: process.env.MONGODB_URI,
    jwt_key: process.env.jwt_key,
    cors_options: [ "https://thegotovet.com" ],
    client_id: process.env.client_id,
    client_secret: process.env.client_secret,
    activate_key: process.env.activate_key,
    refresh_token: process.env.refresh_token,
    user: process.env.user,
    pass: process.env.pass,
    domain: "https://thegotovet.com"
};

