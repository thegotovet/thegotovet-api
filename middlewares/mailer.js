const nodemailer = require("nodemailer");
const xoauth2 = require("xoauth2");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const config = require("../config/config");
const getMailBody = require("./mailer.html");

const sendEMail = async (receiver, subject, id, token) => {
    let client_id = config.client_id;
    let client_secret = config.client_secret;
    let refresh_token = config.refresh_token;

    const oauth2Client = new OAuth2(
        client_id,
        client_secret, // Client Secret
        "https://developers.google.com/oauthplayground" // Redirect URL
    );

    oauth2Client.setCredentials({
        refresh_token
    });
    //const tokens = oauth2Client.getAccessToken();
    

    const Accesstoken = await oauth2Client.getAccessToken();
    //let access_token = Accesstoken.res.data.access_token;
    let expires = Accesstoken.res.data.expiry_date

    const smtpTransport = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            client_id,
            client_secret,
            user: "dgotovet@gmail.com", 
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    let mailBody = getMailBody(id, token);
    
    const mailOptions = {
        from: "dgotovet@gmail.com",
        to: receiver,
        subject,
        generateTextFromHTML: true,
        html: mailBody,
        // auth:{
        //     refresh_token : refresh_token,
        //     access_token: "ya29.ImCwBwsOSe1F4O4RT7k9nlzHRRrZ99-t-4qV2nfaPEJKMGMLyrE_5gGViR0gJoZ9wM8BuI0aAIjqazEAXY0mrHVE1bBSR0JTThP-D-IBv0B9I1ctDiZzl74-WEXMHvbz2R8",
        //     // tls: {
        //     //     rejectUnauthorized: false
        //     // }
        //     user: "dgotovet@gmail.com", 
        // }
    };

    smtpTransport.sendMail(mailOptions, (error, res) => {
        error ? console.log(error) : console.log(res);
        smtpTransport.close();
    });
}

const sendMailv2 = async (receiver, subject, id, token) => {
    var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: config.user,
            pass: config.pass
        }
    });
    let mailBody = getMailBody(id, token);

    const mailOptions = {
        from: config.user, // sender address
        to: receiver, // list of receivers
        subject: subject, // Subject line
        html: mailBody // plain text body
    };

    transporter.sendMail(mailOptions, function(err, info) {
        if (err) console.log(err);
        else console.log(info);
    });
}

const sendMailv3 = async (receiver, subject, id, token) => {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: "OAuth2",
            user: 'dgotovet@gmail.com',
            clientId: config.client_id,
            clientSecret: config.client_secret,
            refreshToken: config.refresh_token
        }
    });

    let mailBody = getMailBody(id, token);

    var mailOptions = {
        from: 'dgotovet@gmail.com',
        to: receiver,
        subject,
        html: mailBody
    }

    transporter.sendMail(mailOptions, function(err, res) {
        err? console.log(err) : console.log(res)
    })
}

module.exports = {
    sendEMail, sendMailv2, sendMailv3
};
