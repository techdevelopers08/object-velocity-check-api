const jwt = require('jsonwebtoken');
const jwtToken = process.env.JWT_SECRET;
const bcrypt = require('bcrypt');
let helper = require("../config/helper");
var randomstring = require("randomstring");
const fetch = require("node-fetch");
const db = require('../models');
const sequelize = require('sequelize');
var uuid = require('uuid').v4;
const Op = sequelize.Op;

const fs = require('fs');


//models
const Users = db.users;


signUp = async (req, res) => {
    try {
        console.log(req.body);
        const required = {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            fullname: req.body.fullname,
            location: req.body.location,
            sport: req.body.sport,
            profile: req.body.profile
        };
        const nonrequired = {
            deviceType: req.body.deviceType,
            deviceToken: req.body.deviceToken
        };
        let requestdata = helper.vaildObject(required, nonrequired);
        let profile;
        let email = await Users.findAll({
            attributes: ['email'],
            where: {
                email: req.body.email
            }
        });
        if (email.length > 0) {
            return helper.error(res, "Your username already registered with us. Please Login");
        }
        let salt = 10;
        await bcrypt.hash(req.body.password, salt).then(function (hash) {
            req.body.password = hash;
        });
        req.body.id = uuid();

        let user = await Users.create(req.body);
        if (user) {
            const credentials = {
                id: user.id,
                email: user.email
            };
            var body = {};
            const token = jwt.sign({ data: credentials }, jwtToken);
            body.token = token;
            body.userDetails = user;
            return helper.success(res, 'User created successfully', body, user);
        } else {
            helper.error(res, "Some error occur, Please try again");
        }
    } catch (err) {
        return helper.error(res, err);
    }
},


    logIn = async (req, res) => {
        try {
            const required = {
                email: req.body.email,
                password: req.body.password
            };
            const nonrequired = {
                deviceType: req.body.deviceType,
                deviceToken: req.body.deviceToken
            };
            let requestdata = await helper.vaildObject(required, nonrequired);
            var salt = 10;
            var user = await Users.findOne({
                where: {
                    [Op.or]: [
                        {
                            email: req.body.email
                        },
                        {
                            username: req.body.email
                        }
                    ]
                }
            });
            if (!user) {
                return helper.error(res, 'This username is not registered with us. Please sign up', body);
            } else {
                var passcheck = "";
                await bcrypt.compare(req.body.password, user.password).then(function (result) {
                    if (result == true) {
                        passcheck = 1;
                    } else {
                        passcheck = 0;
                    }
                });
                if (passcheck == 1) {
                    const credentials = {
                        id: user.id,
                        email: user.email
                    };
                    var body = {};
                    const token = jwt.sign({ data: credentials }, jwtToken);
                    body.token = token
                    body.location = user.location

                    var userdetail = { email: user.email, username: user.username, id: user.id }
                    body.userDetails = userdetail;
                    return helper.success(res, 'User login successfully', body);
                } else {
                    return helper.error(res, 'Email address or password is invalid', body);
                }
            }
        } catch (err) {
            return helper.error(res, err);
        }
    },

    forgotpassword = async (req, res) => {
        console.log('************** forgotpassword **************')
        try {
            var required = {
                email: req.body.email
            }
            var nonrequired = {}
            var requestedData = await helper.vaildObject(required, nonrequired);
            var createOtp = await randomstring.generate({
                length: 4,
                charset: "numeric"
            })
            var findEmail = await Users.findOne({
                where: {
                    email: req.body.email
                }
            })
            if (findEmail) {
                let url = 'https://api.sendinblue.com/v3/smtp/email';
                let options = {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        'api-key': process.env.SEND_IN_BLUE_KEY
                    },
                    body: JSON.stringify({
                        sender: { name: process.env.APP_NAME, email: process.env.FROM_EMAIL },
                        to: [{ email: req.body.email }],
                        replyTo: { email: process.env.REPLY_TO, name: process.env.REPLY_NAME },
                        htmlContent: '<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2"><div style="margin:50px auto;width:70%;padding:20px 0"><div style="border-bottom:1px solid #eee"><a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Velocity</a></div><p style="font-size:1.1em">Hi, ' + findEmail.username + ' </p><p>Thank you for choosing The Velocity. Use the following OTP to complete your Account recovery procedure .</p><h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">' + createOtp + '</h2><p style="font-size:0.9em;">Regards,<br />The Velocity</p><hr style="border:none;border-top:1px solid #eee" /><div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300"><p>Your Brand Inc</p><p>1600 Amphitheatre Parkway</p><p>California</p></div></div></div>',
                        subject: 'Welcome to Velocity'
                    })
                };
                fetch(url, options)
                    .then(res => res.json())
                    .then(json => console.log(json))
                    .catch(err => console.error('error:' + err));
                req.body.verification_code = createOtp;
                var udpateNew = await Users.update(req.body, {
                    where: {
                        email: req.body.email
                    }
                })
                return helper.success(res, 'OTP has been sent to you registered email address')
            } else {
                return helper.error(res, 'Please enter valid email address')
            }
        } catch (err) {
            return helper.error(res, err)
        }
    },

    confirmOtp = async (req, res) => {
        try {
            var required = { otp: req.body.otp, email: req.body.email }
            var nonrequired = await helper.vaildObject(required, nonrequired);
            let otp = await Users.findOne({
                where: { email: req.body.email, }
            });
            let newOtp = otp.dataValues.verification_code;
            console.log("newOtpnewOtpnewOtpnewOtp", newOtp)
            if (req.body.otp == newOtp) {
                let result = await Users.findOne({
                    attributes: ["username"],
                    where: {
                        email: req.body.email,
                    }
                })
                return helper.success(res, "OTP verified successfullly", result);   
            } else {
                return helper.error(res, "Invalid OTP");
            }
        }
        catch (err) {
            return helper.error(res, err);
        }
    },

    resetPassword = async (req, res) => {
        console.log("*****************. resetPassword. ****************");
        try {
            var required = {
                username: req.body.username, //email id
                password: req.body.password,
            }
            var nonrequired = {}
            var requestedData = await helper.vaildObject(required, nonrequired);
            let userData = await Users.findOne({
                where: {
                    email: req.body.username,
                },
            });


            await bcrypt.compare(req.body.password, userData.password).then(async function (result) {
                if (result == true) {
                    return helper.error(res, `New password can${"'"}t be same as old password`)
                } else {
                    var salt = 10;
                    await bcrypt.hash(req.body.password, salt).then(function (hash) {
                        req.body.password = hash
                    })
                    password = req.body.password
                    let result = await Users.update({
                        password: req.body.password,
                    }, {
                        where: {
                            id: userData.id
                        }
                    })
                    return helper.success(res, 'Password changed successfully..!!')
                }
            });

            
        } catch (err) {
            return helper.error(res, err)
        }
    },

    socialLogin = async (req, res) => {
        console.log("******************** socialLogin ******************************");
        try {
            const required = {
                loginType: req.body.loginType,//1- facebook,2-google,3-instagram,4-twitter
                socialId: req.body.socialId,//email or some other social login ids
            };
            const nonRequired = {};
            let requestData = await helper.vaildObject(required, nonRequired);
            userID = helper.randomUUID();
            var user = await Users.findOrCreate({
                where: { email: req.body.socialId },
                defaults: {
                    id: userID,
                    login_type: req.body.loginType,
                    email: req.body.socialId,

                }, row: true
            })
            if (user) {
                const credentials = {
                    id: user[0].id,
                    email: user[0].email,
                };
                const token = jwt.sign({ data: credentials }, jwtToken);
                var body = {
                    token: token,
                    user_id: user[0].id,
                    socialId: user[0].email,
                    address: user[0].address,

                };
                return res.json({ success: 200, message: 'Login successfully', body: body });
            } else {
                return helper.error(res, err);

            }
        } catch (err) {
            return helper.error(res, err);
        }
    },

    alreadyRegEmail = async (req, res) => {
        try {
            var required = {
                email: req.body.email,
            }
            var nonrequired = {}
            var requestedData = await helper.vaildObject(required, nonrequired);
            let email = await Users.findAll({
                attributes: ['email'],
                where: {
                    email: {
                        [Op.like]: '%' + req.body.email + '%'
                    }
                }
            });
            if (email.length != 0) {
                return helper.error(res, "This email address already exist");
            } else {
                return helper.success(res, 'Not Registered')
            }
        } catch (err) {
            return helper.error(res, err)
        }
    },

    updateCurrentlyStatus_ofUser = async (req, res) => {
        console.log("*****************. updateCurrentlyStatus_ofUser. ****************");
        try {
            var required = { 
                set_status: req.body.set_status, //online , offline
            }
            var nonrequired = {}
            var requestedData = await helper.vaildObject(required, nonrequired);
            let userData = await Users.update({
                online_status: req.body.set_status,
                }, {
                where: {
                    id: req.user.id,
                },
            });
            if(req.body.set_status == 'online') {
                return helper.success(res, 'User online')
            } else {
                return helper.success(res, 'User offline')
            }
            
        } catch (err) {
            return helper.error(res, err)
        }
    },

    verifyUserName = async (req, res) => {
        console.log("********************** verifyUserName *************************");
        try {
            var required = {username: req.body.username}
            var nonrequired = {}
            var requestedData = await helper.vaildObject(required, nonrequired);
            let user = await Users.findOne({
                attributes: ['username'],
                where: {username: req.body.username }
            });
            if (user) {
                return helper.error(res, "This username already exist");
            } else {
                return helper.success(res, 'Not Registered')
            }
        } catch (err) {
            return helper.error(res, err)
        }
    },

    
    module.exports = {
        signUp,
        logIn,
        forgotpassword,
        confirmOtp,
        resetPassword,
        socialLogin,
        alreadyRegEmail,
        updateCurrentlyStatus_ofUser,
        verifyUserName
    }

