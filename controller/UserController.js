const jwt = require('jsonwebtoken');
const jwtToken = process.env.JWT_SECRET;
const bcrypt = require('bcrypt');
var randomstring = require("randomstring");
const fetch = require("node-fetch");
const db = require('../models');
const sequelize = require('sequelize');
var uuid = require('uuid').v4;
const Op = sequelize.Op;
let helper = require("../config/helper");

const fs = require('fs');

const fileUpload = require("../helper/fileUploads");
//models
const Users = db.users;
const Video = db.video_detail;
const UserFollow = db.users_follow;
const VideoCount = db.video_views;
const VideoLikes = db.video_likes;
const BlockUser = db.block_user;
const ReportUser = db.report_user;
const Sports = db.sports;
const UsersFollow = db.users_follow;


var offset = process.env.OFFSET;
var limit = process.env.LIMIT;

UserFollow.belongsTo(Users, {
    'foreignKey': 'user_id',
    'targetKey': 'id',
    'as': 'userFollower'
});


UserFollow.belongsTo(Users, {
    'foreignKey': 'follow_id',
    'targetKey': 'id',
    'as': 'userFollowing'
});


// uploadImage = async (req, res) => {
//     try {
//         if (req.files && req.files.attachments) {
//             if (((req.files.attachments).length) !== undefined) {
//                 let files = req.files.attachments
//                 let names = [];
//                 if (files.length > 1) {
//                     files.forEach((file) => {
//                         let file_name_string = file.name;
//                         var file_name_array = file_name_string.split(".");
//                         var file_extension = file_name_array[file_name_array.length - 1];
//                         var result = randomstring.generate(25);
//                         let name = result + "." + file_extension;
//                         file.mv(
//                             process.cwd() + `/../public/uploads/${name}`,
//                             function (err) {
//                                 if (err) throw err;
//                             }
//                         );
//                         names.push(process.env.APP_IMAGE + name);
//                     });
//                 } else {
//                     let file_name_string = attachment.name;
//                     var file_name_array = file_name_string.split(".");
//                     var file_extension = file_name_array[file_name_array.length - 1];
//                     var result = randomstring.generate(25);
//                     let name = result + "." + file_extension;
//                     attachment.mv(
//                         process.cwd() + `/../public/uploads/${name}`,
//                         function (err) {
//                             if (err) throw err;
//                         }
//                     );
//                     names.push(process.env.APP_IMAGE + "uploads/" + name);
//                 }
//                 return helper.success(res, "", names);

//             } else {
//                 let file = req.files.attachments;
//                 let file_name_string = req.files.attachments.name;
//                 var file_name_array = file_name_string.split(".");
//                 var file_extension = file_name_array[file_name_array.length - 1];
//                 var result = randomstring.generate(25);
//                 let name = result + "." + file_extension;

//                 file.mv(
//                     process.cwd() + `/../public/uploads/${name}`,
//                     function (err) {
//                         if (err) throw err;
//                     }
//                 );
//                 return helper.success(res, "", process.env.APP_IMAGE + "uploads/" + name);
//             }
//         }
//     } catch (err) {
//         return helper.error(res, err);
//     }
// },



uploadImage = async (req, res) => {
    if (req.files && req.files.attachments) {
        profile_picture = helper.fileUpload(req.files.attachments);
        req.body.attachments = "/uploads/" + profile_picture;
    } else {
        return helper.success(res, "please select at least one file.", req.body.attachments);
    }
    return helper.success(res, "Upload data", req.body.attachments);
},



    myVideos = async (req, res) => {
        try {
            var required = {}
            var nonrequired = {}
            var requestedData = await helper.vaildObject(required, nonrequired);
            const myVideos = await Video.findAll({
                where: {
                }
            });
            return helper.success(res, 'all videos fetched successfully !!.', myVideos);
        }
        catch (err) {
            return helper.error(res, err);
        }
    },


    followUser = async (req, res) => {
        try {
            var required = {
                userID: req.body.userID,
                status: req.body.status, //1= follow, 0 - unfolow
                type : req.body.type   // followers , following
            }
            var nonrequired = {}
            var requestedData = await helper.vaildObject(required, nonrequired);
            let whereCondition;
            if(req.body.type == 'following') {
                console.log("++++ following +++");
                whereCondition = {
                    user_id: req.user.id, follow_id: req.body.userID
                }
            } else {
                console.log("++++ followers +++");
                whereCondition = {
                    user_id: req.body.userID, follow_id: req.user.id
                }
            }

            if (req.body.status == "1") {
                UserFollow.findOrCreate({
                    where: {
                        user_id: req.user.id,
                        follow_id: req.body.userID
                    },
                    defaults: {
                        id: helper.randomUUID(),
                        user_id: req.user.id,
                        follow_id: req.body.userID
                    }, row: true
                })
            } else {
                UserFollow.destroy({
                    where: whereCondition
                });
            }
            return helper.success(res, "Follow status updated", {});
        }
        catch (err) {
            return helper.error(res, err);
        }
    },


    followersListing = async (req, res) => {
        console.log("****************** followersListing *******************");
        try {
            var required = {
                type: req.body.type,
                id: req.body.id,
            }
            var followersListing
            var followersCount
            var followingCount
            var nonrequired = {}
            var requestedData = await helper.vaildObject(required, nonrequired);

            
            if (req.body.type == "followers") {
                console.log("************** followers. **************");
                followersListing = await UserFollow.findAll({
                    attributes: {
                        include: [
                            [sequelize.literal(`(IFNULL((SELECT round(count(*)) FROM users_follow WHERE users_follow.follow_id = "${requestedData.id}" ), "0" ))`), 'followersCount'],
                            [sequelize.literal(`(IFNULL((SELECT round(count(*)) FROM users_follow WHERE users_follow.user_id = "${requestedData.id}"), "0"))`), 'followingCount'],

                            // [sequelize.literal(`(SELECT count(*) FROM users_follow WHERE users_follow.follow_id = "${req.params.id}" )`), 'followersCount'],
                            // [sequelize.literal(`(SELECT count(*) FROM users_follow WHERE users_follow.user_id = "${req.params.id}")`), 'followingCount'],


                        ],
                    },
                    where: { follow_id: requestedData.id },
                    include: [{
                        attributes: {
                            include: [
                                [sequelize.literal(`(SELECT count(*) FROM users_follow WHERE users_follow.user_id = "${req.user.id}" and users_follow.follow_id = userFollower.id)`), 'isFollowBack'],
                            ]
                        },
                        model: Users,
                        as: 'userFollower',
                    }]
                });
            }
            if (req.body.type == "following") {
                console.log("************** followers. **************");

                followersListing = await UserFollow.findAll({
                    attributes: {
                        include: [
                            [sequelize.literal(`(IFNULL((SELECT round(count(*)) FROM users_follow WHERE users_follow.follow_id = "${requestedData.id}" ), "0" ))`), 'followersCount'],
                            [sequelize.literal(`(IFNULL((SELECT round(count(*)) FROM users_follow WHERE users_follow.user_id = "${requestedData.id}"), "0"))`), 'followingCount'],
                        ],
                    },
                    where: { user_id: requestedData.id },
                    include: [{
                        attributes: {
                            include: [
                                [sequelize.literal(`(SELECT round(count(*)) FROM users_follow WHERE users_follow.user_id = "${req.user.id}" and users_follow.follow_id = userFollowing.id)`), 'isFollowBack'],
                            ]
                        },
                        model: Users,
                        as: 'userFollowing',
                    }]
                });
            }

            if (followersListing.length > 0) {
                followersCount = followersListing[0].dataValues.followersCount
            } else {
                followersCount = "0"
            }

            if (followersListing.length > 0) {
                followingCount = followersListing[0].dataValues.followingCount
            } else {
                followingCount = "0"

            }
            return helper.onSuccess(res, "Data fetched successfully", followersListing, followersCount, followingCount);
        } catch (err) {
            return helper.error(res, err);
        }
    },

    allContacts = async (req, res) => {
        try {
            var required = { offset: req.query.offset, limit: req.query.limit, }
            var nonrequired = {}
            var requestedData = await helper.vaildObject(required, nonrequired);
            const contactsList = await Users.findAll({
                attributes: ["id", "username", "email", "profile", "fullname", "location", "sport", "online_status"],
                offset: (!!req.query.offset) ? parseInt(req.query.offset) : parseInt(offset),
                limit: (!!req.query.limit) ? parseInt(req.query.limit) : parseInt(limit)
            });
            let newData = contactsList.sort((a, b) => a.username.localeCompare(b.username))
            return helper.success(res, 'Contacts fetched successfully !!.', newData);
        }
        catch (err) {
            return helper.error(res, err);
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


    fetchProfile = async (req, res) => {
        try {
            const required = { userID: req.params.id }
            const nonRequired = {};
            let requestData = await helper.vaildObject(required, nonRequired);
            let myData = await Users.findOne({
                attributes: ['id', 'username', 'email', 'profile', 'fullname', 'location', 'online_status', 'is_active', 'sport',
                    [sequelize.literal(`(SELECT count(*) FROM users_follow WHERE users_follow.follow_id = "${req.params.id}" )`), 'followersCount'],
                    [sequelize.literal(`(SELECT count(*) FROM users_follow WHERE users_follow.user_id = "${req.params.id}")`), 'followingCount'],
                    [sequelize.literal(`( select 1 from users_follow where user_id = '${req.user.id}' and follow_id = '${req.params.id}' limit 1 )`), 'isFollow'],
                ],
                where: { id: req.params.id, }
            });
            const yourVideos = await Video.findAll({
                attributes: ["id", "video_url", "user_id", "velocity", "start_point", "end_point", "time", "distance", "description", "created_at", "updated_at", "video_name", "thumbnail",
                    [sequelize.literal(` (IFNULL ((select username from users where users.id = video_detail.user_id), 0))`), 'user_name'],
                    [sequelize.literal(` (IFNULL ((select count(*) from video_views where video_detail.id = video_views.video_id ), 0))`), 'total_views'],
                    [sequelize.literal(` (IFNULL ((select count(*) from video_likes where video_likes.video_id = video_detail.id ), 0))`), 'total_likes'],
                ],
                where: {
                    user_id: req.params.id,
                },
            });
            const userDetails = {
                "userDetail": myData,
                "allVideos": yourVideos
            }
            return helper.success(res, "profile fetched successfully", userDetails);
        } catch (err) {
            return helper.error(res, err);
        }
    },


    updateProfile = async (req, res) => {
        try {
            var required = {}
            var nonrequired = {
                username: req.body.username,
                fullname: req.body.fullname,
                location: req.body.location,
                sport: req.body.sport,
            }
            var requestedData = await helper.vaildObject(required, nonrequired);
            await Users.update({
                username: req.body.username,
                fullname: req.body.fullname,
                location: req.body.location,
                sport: req.body.sport,
            }, {
                where: {
                    id: req.user.id
                }
            })
            return helper.success(res, 'Profile updated successfully')
        } catch (err) {
            return helper.error(res, err)
        }
    },


    blockUser = async (req, res) => {
        console.log("------------blockUser-------------")
        try {
            var required = {
                block_to: req.body.block_to,
            }
            var nonrequired = {}
            var requestedData = await helper.vaildObject(required, nonrequired);
            var user = await BlockUser.findOrCreate({
                where: { block_by: req.user.id },
                defaults: {
                    id: helper.randomUUID(),
                    block_by: req.user.id,
                    block_to: req.body.block_to,
                }, row: true
            })
            return helper.success(res, 'Blocked successfully !!.')
        } catch (err) {
            return helper.error(res, err);
        }
    },



    reportPost = async (req, res) => {
        console.log("------------reportPost-------------")
        try {
            var required = {
                report_type: req.body.report_type,
                id: req.body.id,
                reason: req.body.reason
            }
            var nonrequired = {}
            var requestedData = await helper.vaildObject(required, nonrequired);
            var user = await ReportUser.findOrCreate({
                where: {
                    type: req.body.report_type,
                    report_by: req.user.id,
                    report_to: req.body.id,
                },
                defaults: {
                    type: req.body.report_type,
                    report_by: req.user.id,
                    report_to: req.body.id,
                    reason: req.body.reason
                }, row: true
            })
            return helper.success(res, 'Reported successfully !!.')
        } catch (err) {
            return helper.error(res, err);
        }
    },

    fetchBlockedUsers = async (req, res) => {
        console.log("------------fetchBlockedUsers-------------")

        try {
            const required = {}
            const nonRequired = {};
            let requestData = await helper.vaildObject(required, nonRequired);

            const blockedUsers = await BlockUser.findAll({
                attributes: ["id",
                    [sequelize.literal(` (IFNULL ((select id from users where users.id = block_user.block_to), 0))`), 'blocked_user_id'],
                    [sequelize.literal(` (IFNULL ((select username from users where users.id = block_user.block_to), 0))`), 'user_name'],
                    [sequelize.literal(` (IFNULL ((select email from users where users.id = block_user.block_to), 0))`), 'email'],
                    [sequelize.literal(` (IFNULL ((select profile from users where users.id = block_user.block_to), 0))`), 'profile'],

                ],
                where: {
                    block_by: req.user.id,
                },
            });

            return helper.success(res, "Blocked users fetched successfully", blockedUsers);
        } catch (err) {
            return helper.error(res, err);
        }
    },



    fetchSports = async (req, res) => {
        console.log("------------fetchSports-------------")

        try {
            const required = {}
            const nonRequired = {};
            let requestData = await helper.vaildObject(required, nonRequired);

            const allSports = await Sports.findAll({

            });

            return helper.success(res, "Sports fetched successfully", allSports);
        } catch (err) {
            return helper.error(res, err);
        }
    },

    updateProPicture = async (req, res) => {
        try {
            var required = {}
            var nonrequired = {
                image: req.body.image,
            }
            var requestedData = await helper.vaildObject(required, nonrequired);
            await Users.update({
                profile: req.body.image,
            }, {
                where: {
                    id: req.user.id
                }
            })
            return helper.success(res, 'Profile picture updated successfully')
        } catch (err) {
            return helper.error(res, err)
        }
    },



    changePassword = async (req, res) => {
        console.log("*********** changePassword ************");

        try {
            const required = {
                oldPassword: req.body.oldPassword,
                newPassword: req.body.newPassword
            };

            const nonRequired = {};
            let requestData = await helper.vaildObject(required, nonRequired);

            let userdata = await Users.findOne({
                attributes: ['id', 'password'],
                where: {
                    id: req.user.id
                }
            });
            var passcheck = "";
            console.log("oldPass", userdata.password)
            await bcrypt.compare(requestData.oldPassword, userdata.password).then(function (result) {

                if (result == true) {
                    passcheck = 1;
                } else {
                    passcheck = 0;
                }
            });
            console.log(passcheck);
            if (passcheck == 0) throw "Old password is not correct!";

            let salt = 10;
            await bcrypt.hash(requestData.newPassword, salt).then(function (hash) {
                requestData.newPassword = hash;
            });
            userdata.password = requestData.newPassword;
            userdata.save();

            return helper.success(res, 'Password changed successfully', {});
        } catch (err) {
            helper.error(res, err);
        }
    },


    UsersForChat = async (req, res) => {
        console.log("------------UsersForChat-------------")

        try {
            const required = {}
            const nonRequired = {};
            let requestData = await helper.vaildObject(required, nonRequired);

            const chatUsersList = await UsersFollow.findAll({

                where: {
                    block_by: req.user.id,
                },
            });

            return helper.success(res, "Users List fetched successfully", chatUsersList);
        } catch (err) {
            return helper.error(res, err);
        }
    },

    getFollowingUsers = async (req, res) => {
        console.log("***************  getFollowingMembers ****************");
        try {

            let followersListing = await UserFollow.findOne({

                where: { follow_id: req.user.id },
            });
            console.log("followersListing", followersListing.dataValues)


            let followMembers = await UsersFollow.findAll({
                attributes: ["id", "user_id", "follow_id",
                    [sequelize.literal(` (IFNULL ((select username from users where users.id = users_follow.follow_id ), ""))`), 'username'],
                    [sequelize.literal(` (IFNULL ((select profile from users where users.id = users_follow.follow_id ), ""))`), 'profile'],

                ],
                where: {
                    [Op.and]: [
                        { user_id: req.user.id },
                        { follow_id: followersListing.dataValues.follow_id }
                    ]
                }
            })
            return helper.success(res, "Users fetched successfully", followMembers);
        } catch (err) {
            return helper.error(res, err);
        }
    },


    module.exports = {

        uploadImage,
        myVideos,
        followUser,
        followersListing,
        allContacts,
        socialLogin,
        fetchProfile,
        updateProfile,
        blockUser,
        reportPost,
        fetchBlockedUsers,
        fetchSports,
        updateProPicture,
        changePassword,
        UsersForChat,
        getFollowingUsers


    }

