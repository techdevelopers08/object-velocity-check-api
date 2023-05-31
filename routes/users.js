var express = require('express');
var AuthenticationController = require('../controller/AuthenticationController.js');
var UserController = require('../controller/UserController.js');

const requireAuthentication = require("../passport").authenticateUser;

var router = express.Router();
const passport = require('passport');

router.post('/uploadImage', UserController.uploadImage);
router.get('/myVideos', requireAuthentication, UserController.myVideos);
router.post('/followUser', requireAuthentication, UserController.followUser);
router.post('/followersListing', requireAuthentication, UserController.followersListing);
router.get('/fetchProfile/:id', requireAuthentication, UserController.fetchProfile);
router.post('/updateProfile', requireAuthentication, UserController.updateProfile);
router.get('/allContacts', requireAuthentication, UserController.allContacts);
router.post('/reportPost', requireAuthentication, UserController.reportPost);
router.post('/blockUser', requireAuthentication, UserController.blockUser);
router.post('/updateProPicture', requireAuthentication, UserController.updateProPicture);

router.post('/changePassword', requireAuthentication, UserController.changePassword);

router.get('/fetchBlockedUsers', requireAuthentication, UserController.fetchBlockedUsers);
router.get('/fetchSports', UserController.fetchSports);

router.get('/UsersForChat', requireAuthentication, UserController.UsersForChat);
router.get('/getFollowingUsers', requireAuthentication, UserController.getFollowingUsers);


module.exports = router