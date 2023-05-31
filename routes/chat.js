var express = require('express');
var AuthenticationController = require('../controller/AuthenticationController.js');
var ChatController = require('../controller/ChatController.js');

const requireAuthentication = require("../passport").authenticateUser;

var router = express.Router();
const passport = require('passport');

router.post('/createChatRoom', requireAuthentication, ChatController.createChatRoom);
router.post('/sendMessage', requireAuthentication, ChatController.sendMessage);

router.get('/getChat', requireAuthentication, ChatController.getChat)
router.get('/allChatRooms', requireAuthentication, ChatController.allChatRooms)

router.get('/getOnlineUsers', requireAuthentication, ChatController.getOnlineUsers)

router.post('/removeUserChat', requireAuthentication, ChatController.removeUserChat);
router.get('/getFollowingUsers', requireAuthentication, ChatController.getFollowingUsers);

module.exports = router