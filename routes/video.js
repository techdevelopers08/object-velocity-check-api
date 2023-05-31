var express = require('express');
var AuthenticationController = require('../controller/AuthenticationController.js');
var VideoController = require('../controller/VideoController.js');

const requireAuthentication = require("../passport").authenticateUser;

var router = express.Router();
const passport = require('passport');

router.post('/uploadVideo', requireAuthentication, VideoController.uploadVideo);
router.get('/fetchVideos', requireAuthentication, VideoController.fetchVideos);
router.get('/otherVideos', requireAuthentication, VideoController.otherVideos);
router.post('/videoViewCount', requireAuthentication, VideoController.videoViewCount);
router.get('/newsFeed', requireAuthentication, VideoController.newsFeed);
router.post('/videoLikeUnlike', requireAuthentication, VideoController.videoLikeUnlike);
router.get('/trendingVideoDetail', requireAuthentication, VideoController.trendingVideoDetail);
router.post('/sendVideoComment', requireAuthentication, VideoController.sendVideoComment);
router.post('/deletePost', requireAuthentication, VideoController.deletePost);
router.post('/updateVideoViews', requireAuthentication, VideoController.updateVideoViews);
router.post('/globalSearch', requireAuthentication, VideoController.globalSearch);



module.exports = router