var express = require('express');
var AuthenticationController = require('../controller/AuthenticationController.js');
const requireAuthentication = require("../passport").authenticateUser;
var router = express.Router();
const passport = require('passport');

router.post('/signUp', AuthenticationController.signUp);
router.post('/logIn', AuthenticationController.logIn);
router.post('/forgotPassword', AuthenticationController.forgotpassword);
router.post('/confirmOtp', AuthenticationController.confirmOtp);
router.post('/resetPassword', AuthenticationController.resetPassword);
router.post('/socialLogin', requireAuthentication, AuthenticationController.socialLogin);
router.post('/alreadyRegEmail', AuthenticationController.alreadyRegEmail);
router.post('/updateCurrentlyStatus_ofUser', requireAuthentication,AuthenticationController.updateCurrentlyStatus_ofUser);
router.post('/verifyUserName', AuthenticationController.verifyUserName);

module.exports = router