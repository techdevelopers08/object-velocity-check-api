const jwt = require('jsonwebtoken');
const jwtToken = process.env.JWT_SECRET;
const bcrypt = require('bcrypt');
var randomstring = require("randomstring");
const fetch = require("node-fetch");
const db = require('../models');
const sequelize = require('sequelize');
const Op = sequelize.Op;
var uuid = require('uuid').v4;

const fs = require('fs');

let helper = require("../helper/helper")
const fileUpload = require("../helper/fileUploads");
const { BlockList } = require('net');
//models
const Video = db.video_detail;
const VideoCount = db.video_views;
const VideoLikes = db.video_likes;
const UserFollow = db.users_follow;
const BlockUser = db.block_user;

const VideoComments = db.video_comments;
const Users = db.users;


VideoComments.belongsTo(Users, {
    'foreignKey': 'sender_id',
    'targetKey': 'id',
    'as': 'senderDetails'
});


uploadVideo = async (req, res) => {
    console.log("------------uploadVideo-------------")
    try {
        var required = {
            video_url: req.body.video_url, velocity: req.body.velocity,
            start_point: req.body.start_point, end_point: req.body.end_point, time: req.body.time, distance: req.body.distance,
            description: req.body.description, video_name: req.body.video_name,
            thumbnail: req.body.thumbnail
        }
        var nonrequired = {}
        var requestedData = await helper.vaildObject(required, nonrequired);
        console.log(req.body)
        const videoinfo = await Video.create({
            id: helper.randomUUID(),
            video_url: req.body.video_url,
            velocity: req.body.velocity,
            start_point: req.body.start_point,
            end_point: req.body.end_point,
            time: req.body.time,
            distance: req.body.distance,
            user_id: req.user.id,
            description: req.body.description,
            video_name: req.body.video_name,
            thumbnail: req.body.thumbnail

        })
        const videoVelocity = await Video.findAll({
            attributes: [
                [sequelize.literal(` (IFNULL ((select velocity  from video_detail where video_detail.user_id = '` + req.user.id + `' ORDER BY velocity DESC limit 1 ), 0))`), 'highest_velocity'],
            ],
            where: {
                user_id: req.user.id,
            },
        });
        var videoDetails = {
            id: videoinfo.id,
            video_url: videoinfo.video_url,
            user_id: videoinfo.user_id,
            velocity: videoinfo.velocity,
            start_point: videoinfo.start_point,
            end_point: videoinfo.end_point,
            time: videoinfo.time,
            distance: videoinfo.distance,
            description: videoinfo.description,
            video_name: videoinfo.video_name,
            thumbnail: videoinfo.thumbnail

        }
        let highestvelocity = "0";
        let highest_velocity = videoVelocity[0].dataValues.highest_velocity;
        let velocity = req.body.velocity;

        if (parseInt(velocity) >= parseInt(highest_velocity)) {
            highestvelocity = req.body.velocity
        } else {
        }
        const newData = {
            highest_velocity: highestvelocity,
            videoInfo: videoDetails,
        };

        return helper.success(res, 'video uploaded successfully !!.', newData)
    } catch (err) {
        return helper.error(res, err);
    }
},

    fetchVideos = async (req, res) => {
        console.log("------------fetchVideos..-------------")
        try {
            var required = {}
            var nonrequired = {}
            var requestedData = await helper.vaildObject(required, nonrequired);
            const yourVideos = await Video.findAll({
                attributes: ["id", "video_url", "user_id", "velocity", "start_point", "end_point", "time", "distance", "description", "created_at", "updated_at", "video_name", "thumbnail", "views_count",
                    [sequelize.literal(` (IFNULL ((select username from users where users.id = video_detail.user_id), 0))`), 'user_name'],
                    [sequelize.literal(` (IFNULL ((select count(*) from video_views where video_detail.id = video_views.video_id ), 0))`), 'total_views'],
                ],
                where: {
                    user_id: req.user.id,
                },
            }); 
            const popularVideos = await Video.findAll({
                attributes: ["id", "video_url", "user_id", "velocity", "start_point", "end_point", "time", "distance", "description", "created_at", "updated_at", "video_name", "thumbnail", "views_count",
                    [sequelize.literal(` (IFNULL ((select username from users where users.id = video_detail.user_id), 0))`), 'user_name'],
                    [sequelize.literal(` (IFNULL ((select count(*) from video_views where video_detail.id = video_views.video_id ), 0))`), 'total_views'],
                ],
                // where: {
                //     user_id: req.user.id,
                // },
                having: sequelize.literal(` total_views > 0 order by total_views DESC `)
            });
            const videoListing = {
                "yourVideos": yourVideos,
                "popularVideos": popularVideos
            }
            return helper.success(res, 'videos fetched successfully !!.', videoListing)
        } catch (err) {
            return helper.error(res, err);
        }
    },

    otherVideos = async (req, res) => {
        console.log("------------otherVideos-------------")
        try {
            const required = { offset: req.query.offset, limit: req.query.limit }
            var nonrequired = {}
            var requestedData = await helper.vaildObject(required, nonrequired);
            const otherVideo = await Video.findAll({
                attributes: ["id", "video_url", "user_id", "velocity", "start_point", "end_point", "time", "distance", "description", "created_at", "updated_at", "video_name", "thumbnail",
                    [sequelize.literal(` (IFNULL ((select username from users where users.id = video_detail.user_id), 0))`), 'user_name'],
                    [sequelize.literal(` (IFNULL ((select count(*) from video_views where video_detail.id = video_views.video_id ), 0))`), 'total_views'],
                ],
                where: { user_id: { [Op.ne]: req.user.id } },
                offset: (!!req.query.offset) ? parseInt(req.query.offset) : parseInt(offset),
                limit: (!!req.query.limit) ? parseInt(req.query.limit) : parseInt(limit)

            });
            return helper.success(res, 'videos fetched successfully !!.', otherVideo)
        } catch (err) {
            return helper.error(res, err);
        }
    },

    videoViewCount = async (req, res) => {
        console.log("------------videoViewCount-------------")
        try {
            var required = {
                video_id: req.body.video_id,
            }
            var nonrequired = {}
            var requestedData = await helper.vaildObject(required, nonrequired);
            var videoinfo = await VideoCount.findOrCreate({
                where: { user_id: req.user.id, },
                defaults: {
                    id: helper.randomUUID(),
                    video_id: req.body.video_id,
                    user_id: req.user.id,
                }, row: true
            })
            return helper.success(res, 'video count updated successfully !!.')
        } catch (err) {
            return helper.error(res, err);
        }
    },

    updateVideoViews = async (req, res) => {
        console.log("------------ updateVideoViews -------------")
        try {
            var required = {
                video_id: req.body.video_id,
            }
            var nonrequired = {}
            var requestedData = await helper.vaildObject(required, nonrequired);
            var videoinfo = await VideoCount.findOrCreate({
                where: { user_id: req.user.id, video_id: req.body.video_id},
                defaults: {
                    id: helper.randomUUID(),
                    video_id: req.body.video_id,
                    user_id: req.user.id,
                }, row: true
            })

            var videoDetail = await Video.findOne({
                where: {
                    id: req.body.video_id}
            })
            if(videoinfo){
                console.log(videoDetail.views_count, "***************** views_count ==> ");
                let nowVideoView  = videoDetail.views_count;
                nowVideoView += 1;
                console.log(nowVideoView, "***************** NOWWW views_count ==> ");
                var videoDetail = await Video.update({
                    views_count : nowVideoView},{
                    where: {id: req.body.video_id}
                })
                return helper.success(res, 'video count updated successfully !!.')
            } else {
                return helper.error(res, 'Something went wrong')
            }
        
        } catch (err) {
            return helper.error(res, err);
        }
    },

    newsFeed = async (req, res) => {
        console.log("------------newsFeed-------------")
        try {
            const required = {}
            var nonrequired = {}
            var requestedData = await helper.vaildObject(required, nonrequired);

            //GET Block users
            let blockedUsers = await BlockUser.findOne({
                attributes: [
                    [sequelize.fn('GROUP_CONCAT', sequelize.col('block_to')), 'block_id']
                ],
                where: {
                    block_by: req.user.id
                },
                row: true
            })

            console.log("blockedUsers.dataValues.block_id;", blockedUsers.dataValues.block_id)
            let block_ids = 0;

            if (blockedUsers.dataValues.block_id != null) {

                block_ids = block_ids + ',' + blockedUsers.dataValues.block_id;
            }
            if (block_ids != 0) {
                block_ids = block_ids.split(",");
            } else {
                block_ids = [0];
            }


            const newVideos = await Video.findAll({
                attributes: ['id', 'video_url', 'user_id', 'velocity', 'start_point', 'end_point', 'time', 'distance', 'description', 'video_name', 'created_at', 'updated_at', 'views_count', "thumbnail",
                    [sequelize.literal(` (IFNULL ((select username from users where users.id = video_detail.user_id), 0))`), 'user_name'],
                    [sequelize.literal(` (IFNULL ((select profile from users where users.id = video_detail.user_id), 0))`), 'profile'],
                    [sequelize.literal(` (IFNULL ((select count(*) from video_likes where video_likes.video_id = video_detail.id ), 0))`), 'total_likes'],
                    [sequelize.literal(` (IFNULL ((select count(*) from video_likes where video_likes.video_id = video_detail.id  and video_likes.user_id='${req.user.id}'), 0))`), 'is_like'],
                    [sequelize.literal(` (IFNULL ((select 1 from users_follow where users_follow.user_id  = '${req.user.id}' and video_detail.user_id = users_follow.follow_id limit 1 ), 0))`), 'is_follow'],
                    [sequelize.literal(` (IFNULL ((select count(*) from video_comments where video_comments.video_id = video_detail.id  and video_comments.sender_id='${req.user.id}'), 0))`), 'total_comments'],
                ],
                limit: 4,
                where: {
                    user_id: { [Op.ne]: req.user.id },
                    user_id: { [Op.notIn]: block_ids }
                },
                order: [
                    ['created_at', 'DESC'],
                ],
            });
            const trendingVideos = await Video.findAll({
                attributes: ['id', 'video_url', 'user_id', 'velocity', 'start_point', 'end_point', 'time', 'distance', 'description', 'video_name', 'created_at', 'updated_at', 'views_count', "thumbnail",
                    [sequelize.literal(` (IFNULL ((select username from users where users.id = video_detail.user_id), 0))`), 'user_name'],
                    [sequelize.literal(` (IFNULL ((select profile from users where users.id = video_detail.user_id), 0))`), 'profile'],
                    [sequelize.literal(` (IFNULL ((select count(*) from video_likes where video_likes.video_id = video_detail.id ), 0))`), 'total_likes'],
                    [sequelize.literal(` (IFNULL ((select count(*) from video_likes where video_likes.video_id = video_detail.id  and video_likes.user_id='${req.user.id}'), 0))`), 'is_like'],
                    [sequelize.literal(` (IFNULL ((select 1 from users_follow where users_follow.user_id  = '${req.user.id}' and video_detail.user_id = users_follow.follow_id limit 1 ), 0))`), 'is_follow'],
                    [sequelize.literal(` (IFNULL ((select count(*) from video_comments where video_comments.video_id = video_detail.id ), 0))`), 'total_comments'],
                ],
                where: {
                    user_id: { [Op.ne]: req.user.id },
                    user_id: { [Op.notIn]: block_ids }
                },
                having: sequelize.literal(` total_likes != 0  ORDER BY total_likes DESC `)
            });
            const videos = {
                "newVideos": newVideos,
                "trendingVideos": trendingVideos
            }
            return helper.success(res, 'videos fetched successfully !!.', videos)
        } catch (err) {
            return helper.error(res, err);
        }
    },

    videoLikeUnlike = async (req, res) => {
        console.log("------------videoLikeUnlike-------------")
        const socketio = req.app.get('io');
        try {
            const required = { video_id: req.body.video_id, is_like: req.body.is_like }
            const nonRequired = {};
            let requestData = await helper.vaildObject(required, nonRequired);
            console.log(req.body);
            if (requestData.is_like == "0") {
                console.log("++++++++++++ unlike ......");
                VideoLikes.destroy({ where: { video_id: req.body.video_id, user_id: req.user.id } });
            } else {
                console.log("++++++++++++ Like ......");
                var videoLikes = await VideoLikes.findOrCreate({
                    where: { user_id: req.user.id, video_id: requestData.video_id },
                    defaults: {
                        video_id: requestData.video_id,
                        user_id: req.user.id
                    },
                })
            }
            socketio.emit("returnVideoLike", videoLikes);
            if (requestData.is_like == "1")
                return helper.success(res, "Video like Successfully");
            else
                return helper.success(res, "Video Unlike Successfully", {});
        } catch (err) {
            return helper.error(res, err);
        }
    },


    trendingVideoDetail = async (req, res) => {
        console.log("------------trendingVideoDetail-------------")
        try {
            const required = { id: req.query.id }
            var nonrequired = {}
            var requestData = await helper.vaildObject(required, nonrequired);
            const videoDetail = await Video.findOne({
                attributes: ['id', 'video_url', 'user_id', 'description', 'video_name', 'created_at', 'updated_at', 'views_count', "thumbnail",
                    [sequelize.literal(` (IFNULL ((select username from users where users.id = video_detail.user_id), 0))`), 'user_name'],
                    [sequelize.literal(` (IFNULL ((select profile from users where users.id = video_detail.user_id), 0))`), 'profile'],
                    [sequelize.literal(` (IFNULL ((select count(*) from video_likes where video_likes.video_id = video_detail.id ), 0))`), 'total_likes'],
                    [sequelize.literal(` (IFNULL ((select count(*) from video_likes where video_likes.video_id = video_detail.id  and video_likes.user_id='${req.user.id}'), 0))`), 'is_like'],
                    [sequelize.literal(` (IFNULL ((select 1 from users_follow where users_follow.user_id  = '${req.user.id}' and video_detail.user_id = users_follow.follow_id limit 1 ), 0))`), 'is_follow'],
                    [sequelize.literal(` (IFNULL ((select count(*) from video_comments where video_comments.video_id = video_detail.id ), 0))`), 'total_comments'],


                ],
                where: {
                    id: requestData.id,
                },
            });
            const stats = await Video.findOne({
                attributes: ['velocity', 'start_point', 'end_point', 'time', 'distance',
                ],
                where: {
                    id: requestData.id,
                },
            });
            const videoComments = await VideoComments.findAll({
                attributes: ['id', 'sender_id', 'video_id', 'comment', 'status', 'created_at',
                    [sequelize.literal(` (IFNULL ((select username from users where users.id = video_comments.sender_id), 0))`), 'user_name'],
                    [sequelize.literal(` (IFNULL ((select profile from users where users.id = video_comments.sender_id), 0))`), 'profile'],
                ],
                where: {
                    video_id: requestData.id,
                },
            });
            const aboutVideo = {
                "videoDetail": videoDetail,
                "stats": stats,
                "videoComments": videoComments
            }
            return helper.success(res, 'detail fetched successfully !!.', aboutVideo)
        } catch (err) {
            return helper.error(res, err);
        }
    },


    sendVideoComment = async (req, res) => {
        console.log("***************  sendVideoComment ****************");
        const socketio = req.app.get('io');
        try {
            const required = { comment: req.body.comment, video_id: req.body.video_id, status: req.body.status };
            const nonRequired = {};
            let requestData = await helper.vaildObject(required, nonRequired);
            var videoComments = await VideoComments.create({
                comment: requestData.comment,
                status: requestData.status,
                sender_id: req.user.id,
                video_id: requestData.video_id
            })
            if (!!videoComments) {
                let commentsListing = await VideoComments.findOne({
                    attributes: ["id", "sender_id", "video_id", "comment", "status", "created_at"],
                    include: [
                        {
                            attributes: ["username", "email", "profile"],
                            model: Users,
                            as: 'senderDetails',
                        },
                    ],
                    where: {
                        id: videoComments.id,
                    },
                })
                socketio.emit("returnVideoComment", commentsListing);
                return helper.success(res, "comment send Successfully");
            } else
                return helper.error(res, "Some error occured");
        } catch (err) {
            return helper.error(res, err);
        }
    },



    deletePost = async (req, res) => {
        console.log("------------deletePost-------------")
        try {
            var required = {
                video_id: req.body.video_id,
            }
            var nonrequired = {}
            var requestedData = await helper.vaildObject(required, nonrequired);
            Video.destroy({ where: { id: req.body.video_id } })
            return helper.success(res, 'video deleted successfully !!.')
        } catch (err) {
            return helper.error(res, err);
        }
    },


    globalSearch = async (req, res) => {
        console.log("***************  globalSearch..!! ****************");
        //search by video titile or user name
        //type - 1 = all , 2 - user,  3 - popular, 4 - new
        try {
            const required = { searchText: req.body.searchText,  type: req.body.type };
            const nonRequired = {};
            let requestData = await helper.vaildObject(required, nonRequired);

            //GET Block users
            let blockedUsers = await BlockUser.findOne({
                attributes: [[sequelize.fn('GROUP_CONCAT', sequelize.col('block_to')), 'block_id']],
                where: {block_by: req.user.id},row: true
            })

           // console.log("blockedUsers.dataValues.block_id;", blockedUsers.dataValues.block_id)
            let block_ids = 0;
            if (blockedUsers.dataValues.block_id != null) {
                block_ids = block_ids + ',' + blockedUsers.dataValues.block_id;
            }
            if (block_ids != 0) {
                block_ids = block_ids.split(",");
            } else {
                block_ids = [0];
            }

            const popularVideos = await Video.findAll({
                attributes: ['id', 'video_url', 'user_id', 'velocity', 'start_point', 'end_point', 'time', 'distance', 'description', 'video_name', 'created_at', 'updated_at', 'views_count', "thumbnail",
                    [sequelize.literal(` (IFNULL ((select username from users where users.id = video_detail.user_id), 0))`), 'user_name'],
                    [sequelize.literal(` (IFNULL ((select profile from users where users.id = video_detail.user_id), 0))`), 'profile'],
                    [sequelize.literal(` (IFNULL ((select count(*) from video_likes where video_likes.video_id = video_detail.id ), 0))`), 'total_likes'],
                    [sequelize.literal(` (IFNULL ((select count(*) from video_likes where video_likes.video_id = video_detail.id  and video_likes.user_id='${req.user.id}'), 0))`), 'is_like'],
                    [sequelize.literal(` (IFNULL ((select 1 from users_follow where users_follow.user_id  = '${req.user.id}' and video_detail.user_id = users_follow.follow_id limit 1 ), 0))`), 'is_follow'],
                    [sequelize.literal(` (IFNULL ((select count(*) from video_comments where video_comments.video_id = video_detail.id  and video_comments.sender_id='${req.user.id}'), 0))`), 'total_comments'],
                ],
                where: {
                    user_id: { [Op.notIn]: block_ids },
                    video_name: { [Op.like]: `${req.body.searchText}%` },
                }
            });
            
            const newVideos = await Video.findAll({
                attributes: ['id', 'video_url', 'user_id', 'velocity', 'start_point', 'end_point', 'time', 'distance', 'description', 'video_name', 'created_at', 'updated_at', 'views_count', "thumbnail",
                    [sequelize.literal(` (IFNULL ((select username from users where users.id = video_detail.user_id), 0))`), 'user_name'],
                    [sequelize.literal(` (IFNULL ((select profile from users where users.id = video_detail.user_id), 0))`), 'profile'],
                    [sequelize.literal(` (IFNULL ((select count(*) from video_likes where video_likes.video_id = video_detail.id ), 0))`), 'total_likes'],
                    [sequelize.literal(` (IFNULL ((select count(*) from video_likes where video_likes.video_id = video_detail.id  and video_likes.user_id='${req.user.id}'), 0))`), 'is_like'],
                    [sequelize.literal(` (IFNULL ((select 1 from users_follow where users_follow.user_id  = '${req.user.id}' and video_detail.user_id = users_follow.follow_id limit 1 ), 0))`), 'is_follow'],
                    [sequelize.literal(` (IFNULL ((select count(*) from video_comments where video_comments.video_id = video_detail.id  and video_comments.sender_id='${req.user.id}'), 0))`), 'total_comments'],
                ],
                limit: 4,
                where: {
                    user_id: { [Op.notIn]: block_ids },
                    video_name: { [Op.like]: `${req.body.searchText}%` },
                },
                order: [
                    ['id', 'DESC'],
                ],
            });

            //get users by search
            let userData = await Users.findAll({
                attributes: ['id', 'username', 'email', 'profile', 'fullname', 'location', 'online_status', 'is_active', 'sport',
                    [sequelize.literal(`(SELECT count(*) FROM users_follow WHERE users_follow.follow_id = "${req.params.id}" )`), 'followersCount'],
                    [sequelize.literal(`(SELECT count(*) FROM users_follow WHERE users_follow.user_id = "${req.params.id}")`), 'followingCount'],
                ],
                where: {
                    username: { [Op.like]: `${req.body.searchText}%` }
                }
            });
            let Data;
            if(req.body.type == 1) {
                Data = {
                    "user": userData,
                    "popularVideos": popularVideos,
                    "newVideos": popularVideos
                }
            } else if (req.body.type == 2) {
                Data = {
                    "user": userData,
                }
            } else if (req.body.type == 3) {
                Data = {
                    "popularVideos": popularVideos,
                }
            } else {
                Data = {
                    "newVideos": popularVideos,
                }
            }
            return helper.success(res, 'fetched data successfully !!.', Data)
        } catch (err) {
            return helper.error(res, err);
        }
    },



    module.exports = {

        uploadVideo,
        fetchVideos,
        otherVideos,
        videoViewCount,
        newsFeed,
        videoLikeUnlike,
        trendingVideoDetail,
        sendVideoComment,
        deletePost,
        updateVideoViews,
        globalSearch
    }

