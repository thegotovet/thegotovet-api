const user_model = require('../models/user');
const config = require('../config/config');
const bcrypt = require("bcrypt");
const JWT = require('jsonwebtoken');
const { validationResult } = require("express-validator");

const { sendMailv2, sendEMail, sendMailv3 } = require("../middlewares/mailer");

const errorFormatter = ({msg}) => {
    return msg;
};

const activateToken = () => {
    return token = JWT.sign({
        iss: 'thetogovet',
        iat: new Date().getTime()
    }, config.activate_key);
}

const user_controllers = {
    register : async (req, res) => {
        const errors = validationResult(req).formatWith(errorFormatter);
        if (!errors.isEmpty()){
            return res.status(403).send({ errors: errors.array() });
        }

        const salt_rounds = 10;
        const hash = await bcrypt.hash(req.body.password, salt_rounds);

        let create_user = {
            name: req.body.name,
            email: req.body.email.toLowerCase(),
            phone_number: req.body.phone_number,
            password: hash,
            address: req.body.address,
            state: req.body.state,
            city: req.body.city,
            is_vet: req.body.is_vet? true : false
        }

        const user = await user_model.findOne({ email: create_user.email }, 'email')
        if (user) {
            return res.status(403).send({
                status: false,
                msg: "email already exists"
            });
        }
        //console.log(create_user)
        
        (new user_model(create_user)).save((err, user) => {
            if (err) return res.status(422).send({
                status: false,
                msg: 'error in creating user'
            });

            let activate_token = activateToken();
            sendMailv3(
                create_user.email,
                "Confirm your account on thegotovet",
                user.id,
                activate_token
            );

            res.status(201).send({
                status: true,
                msg: 'successfully registered, please check your mail for confirmation'
            });
        });
    }, 
    login: async (req, res) => {
        const errors = validationResult(req).formatWith(errorFormatter);
            if (!errors.isEmpty()){
                return res.status(422).send({ errors: errors.array() });
        }

        var email = req.body.email;
        var password = req.body.password;

        var user = await user_model.findOne({ email }, 'email name password phone_number');
        if (!user) {
            return res.status(404).send({
                status: false,
                msg: "user not found"
            });
        }

        var compare_passwords = await bcrypt.compare(password, user.password);
        if (!compare_passwords) {
            return res.status(404).send({
                status: false,
                msg: "authentication failed"
            });
        }
        let time = new Date();
        let hour = time.getHours();

        const payload = {
            email: user.email,
            expires: time.setHours(hour + 2)
        }

        // var token = jwt.sign(payload, config.login_key, {expiresIn: '2h'}, {algorithm: 'RS256'});
        var token = JWT.sign({
            iss: 'IGoder',
            sub: user.id,
            iat: new Date().getTime(),
            exp: new Date().setDate(new Date().getDate() + 1)
        }, config.jwt_key);

        if (!token) {
            return res.status(522).send({
                status: false,
                msg: 'contact admin'
            });
        }

        return res.status(200).send({
            status: true,
            msg: "successfully logged in",
            payload: payload.email,
            token
        });
    },
    get_users: async (req, res) => {
        const errors = validationResult(req).formatWith(errorFormatter);
        if (!errors.isEmpty()) {
            return res.status(422).send({ errors: errors.array() });
        }

        var users = await user_model.find({});
        var usersDTO = {};

        users.forEach((user, i) => {
            usersDTO[i] = {
                email: user.email,
                name: user.name,
                phone_number: user.phone_number
            }
        });

        res.status(200).send({status: true, data: usersDTO})
    },
    activate: async (req, res) => {
        let id = req.body.params.id;
        let token = req.body.params.token;
        
        if (!id || !token)
            return res.status(403).send({
                status: false,
                msg: 'please provide neccesarry parameters'
            });

        try {
            const decoded = JWT.verify(token, config.activate_key);
        } catch (ex) {
            return res.status(401).send({
                status: false,
                msg: "token provided is false"
            });
        }
        
        const user = await user_model.findById(id);
        if (!user){
            return res.status(404).send({
                status: false,
                msg: "user not found"
            });
        }

        if (user.activated) {
            return res.status(200).send({
                status: false,
                msg: "user has already been activated"
            });
        }

        user.activated = true;
        user.save((err, done) => {
            if (err) 
                return res.status(500).send({
                    status: false,
                    msg: "user could not be updated"
                });

            res.status(200).send({
                status: true,
                msg: "user has been activated"
            });
        })
    }
};

module.exports = user_controllers;
