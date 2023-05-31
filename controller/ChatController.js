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


var offset = process.env.OFFSET;
var limit = process.env.LIMIT;
//models

const ChatRoomMessages = db.chat_messages;
const CreateChatRoom = db.chat_rooms;
const Users = db.users;
const usersFollow = db.users_follow;


ChatRoomMessages.belongsTo(Users, {
    'foreignKey': 'sender_id',
    'targetKey': 'id',
    'as': 'senderDetails'
});
usersFollow.belongsTo(Users, {
    'foreignKey': 'follow_id',
    'targetKey': 'id',
    'as': 'userDetail'
});

CreateChatRoom.belongsTo(ChatRoomMessages, { 'foreignKey': 'room_id', 'targetKey' : 'room_id' ,'as': 'msgInfo'});


createChatRoom = async (req, res) => {
    console.log("***************  createChatRoom ****************", req.body.receiver_id);
    try {
        const required = { receiver_id: req.body.receiver_id }
        const nonRequired = {};
        let requestData = await helper.vaildObject(required, nonRequired);
        let roomId = helper.randomUUID()
        const chatRoom = await CreateChatRoom.findOrCreate({
            where: {
                [Op.or]: [{
                    user_id: req.user.id,
                    receiver_id: req.body.receiver_id
                },
                {
                    user_id: req.body.receiver_id,
                    receiver_id: req.user.id
                }
                ]
            }
            , raw: true,
            defaults: {
                room_id: roomId,
                user_id: req.user.id,
                receiver_id: req.body.receiver_id,
            },
            attributes: {
                include: [
                    [sequelize.literal(` (IFNULL ((select profile from users where users.id = '${req.body.receiver_id}' limit 1 ), 0))`), 'receiver_image_url'],
                    [sequelize.literal(` (IFNULL ((select username from users where users.id = '${req.body.receiver_id}' limit 1 ), 0))`), 'receiver_name'],
                    [sequelize.literal(` (IFNULL ((select online_status from users where users.id = '${req.body.receiver_id}' limit 1 ), 0))`), 'online_status'],
                ]
            },

        });

        return helper.success(res, "Chat room created successfully", { "chatRoomId": chatRoom[0].room_id, "reciever_name": chatRoom[0].receiver_name, "reciever_image": chatRoom[0].receiver_image_url, "online_status": chatRoom[0].online_status });
    } catch (err) {
        return helper.error(res, err);
    }
},

    sendMessage = async (req, res) => {
        console.log("***************  sendMessage ****************");
        const socketio = req.app.get('io');
        try {
            const required = { message: req.body.message, message_type: req.body.message_type, status: req.body.status, room_id: req.body.chatRoomId };
            const nonRequired = {};
            let requestData = await helper.vaildObject(required, nonRequired);
            var chatMessage = await ChatRoomMessages.create({
                message: requestData.message,
                message_type: requestData.message_type,
                status: requestData.status,
                sender_id: req.user.id,
                room_id: requestData.room_id
            })
            if (!!chatMessage) {
                let messagesListing = await ChatRoomMessages.findOne({
                    attributes: ["id", "room_id", "sender_id", "message", "message_type", "status", "created_at",
                        [sequelize.literal(` (IFNULL (( select date(created_at) from chat_messages  as chatMsg WHERE chatMsg.id = chat_messages.id ), ''))`), 'createdAt_date']],
                    include: [
                        {
                            attributes: ["username", "email",
                                [sequelize.literal(` (IFNULL ((select profile from users where users.id = chat_messages.sender_id limit 1 ), 0))`), 'image_url']
                            ],
                            model: Users,
                            as: 'senderDetails',
                        },
                    ],
                    where: {
                        id: chatMessage.id,
                    },
                })
                socketio.emit("returnChatMessage", messagesListing);
                return helper.success(res, "Message send Successfully");
            } else
                return helper.error(res, "Some error occured");
        } catch (err) {
            return helper.error(res, err);
        }
    },


    getChat = async (req, res) => {
        console.log("***************  getChat ****************");
        try {
            const required = { room_id: req.query.chatRoomId };
            const nonRequired = {};
            let requestData = await helper.vaildObject(required, nonRequired);
            let messagesListing = await ChatRoomMessages.findAll({
                attributes: ["id", "room_id", "created_at", "sender_id", "message", "message_type", "status",
                [sequelize.literal(` (IFNULL (( select date(created_at) from chat_messages  as chatMsg WHERE chatMsg.id = chat_messages.id ), ''))`), 'createdAt_date']
                ],
                where: {
                    room_id: req.query.chatRoomId
                },
                include: [
                    {
                        attributes: ["username", "email",
                            [sequelize.literal(` (IFNULL ((select profile from users where users.id = chat_messages.sender_id limit 1 ), 0))`), 'image_url']
                        ],
                        model: Users,
                        as: 'senderDetails',
                    }],
                order: [
                    ['id', 'DESC']
                ],
                // offset: (!!req.query.offset) ? parseInt(req.query.offset) : parseInt(offset),
                // limit: (!!req.query.limit) ? parseInt(req.query.limit) : parseInt(limit)
            })
            var roomMemberStatus = await ChatRoomMessages.update({
                read_message: 1
            }, {
                where: {
                    room_id: req.query.chatRoomId
                }
            });
            const messages = messagesListing.reverse()
            return helper.success(res, "Messages fetched successfully", messages);
        } catch (err) {
            return helper.error(res, err);
        }
    },

    allChatRooms = async (req, res) => {
        console.log("***************  allChatRooms ****************");
        try {
            const required = {};
            const nonRequired = {};
            let requestData = await helper.vaildObject(required, nonRequired);
            let allChatRooms = await CreateChatRoom.findAll({
                attributes: ["id", "user_id", "receiver_id", "room_id",
                    [sequelize.literal(` (IFNULL (( case when chat_rooms.user_id = '` + req.user.id + `' then (select profile from users where users.id = chat_rooms.receiver_id limit 1 ) else (select profile from users where users.id = chat_rooms.user_id limit 1 ) end ), ''))`), 'receiver_image_url'],
                    [sequelize.literal(` (IFNULL (( case when chat_rooms.user_id = '` + req.user.id + `' then (select username from users where users.id = chat_rooms.receiver_id limit 1 ) else (select username from users where users.id = chat_rooms.user_id limit 1 ) end ), 0))`), 'sender_name'],
                    [sequelize.literal(` (IFNULL ((select message from chat_messages where chat_messages.room_id = chat_rooms.room_id order by id DESC limit 1 ), ""))`), 'last_message'],
                    [sequelize.literal(` (IFNULL ((select created_at from chat_rooms where chat_rooms.room_id = chat_rooms.room_id order by id DESC limit 1 ), ""))`), 'created_at'],
                    [sequelize.literal(` (IFNULL ((select count(*) from chat_messages where chat_messages.room_id = chat_rooms.room_id and chat_messages.sender_id != '` + req.user.id + `' and read_message = 0 limit 1 ), 0))`), 'unread_messages'],
                    [sequelize.literal(` (IFNULL ((select message_type from chat_messages where chat_messages.room_id = chat_rooms.room_id order by id DESC limit 1 ), ""))`), 'message_type'],
                    [sequelize.literal(` (IFNULL ((select online_status from users where users.id = chat_rooms.receiver_id limit 1 ), 0))`), 'is_online'],
                ],
                where : {
                    [Op.or] : [
                      { user_id: req.user.id },
                      { receiver_id: req.user.id },
                    ]
                },
                group : ['id'],
                order: [
                    [sequelize.literal('( select id from chat_messages where chat_messages.room_id = chat_rooms.room_id  order by id desc limit 1 )'), 'DESC']
                ],
                include: [{
                    model: ChatRoomMessages,
                    'as': 'msgInfo',
                    attributes: [],
                    required : true
                  }],
                offset: (!!req.query.offset) ? parseInt(req.query.offset) : parseInt(offset),
                limit: (!!req.query.limit) ? parseInt(req.query.limit) : parseInt(limit)
            })
            //const chatRooms = allChatRooms.reverse()
            return helper.success(res, "Chat rooms fetched successfully", allChatRooms);
        } catch (err) {
            return helper.error(res, err);
        }
    },

    getOnlineUsers = async (req, res) => {
        try {
            const required = {}
            const nonRequired = {};
            let requestData = await helper.vaildObject(required, nonRequired);
            let onlineUsers = await Users.findAll({
                attributes: ["id", "username", "email", "online_status", "profile"],
                where: {
                    id: { [Op.ne]: req.user.id },
                },
                having: sequelize.literal(`online_status = 'online'`)
            })

            return helper.success(res, "Online Users fetched successfully", onlineUsers);
        } catch (err) {
            return helper.error(res, err);
        }
    },

    removeUserChat = async (req, res) => {
        console.log("*********** removeUserChat ************");
        try {
            var required = {
                room_id: req.body.room_id,

            }
            var nonrequired = {}
            var requestedData = await helper.vaildObject(required, nonrequired);

            const deleteChatRoom = await CreateChatRoom.destroy({
                where: {
                    room_id: requestedData.room_id,
                    user_id: req.user.id
                },
            });
            return helper.success(res, 'Removed successfully')
        } catch (err) {
            return helper.error(res, err)
        }
    },

    getFollowingUsers = async (req, res) => {
        console.log("******************** getFollowingUsers **********************");
        try {
            const required = {}
            const nonRequired = {};
            let requestData = await helper.vaildObject(required, nonRequired);
            let followingUsers = await usersFollow.findAll({
                where: {
                    user_id: req.user.id
                },
                include : {
                    model : Users,
                    as : "userDetail"
                }
            })
            return helper.success(res, "Users fetched successfully", followingUsers);
        } catch (err) {
            return helper.error(res, err);
        }
    },

    module.exports = {
        createChatRoom,
        sendMessage,
        getChat,
        allChatRooms,
        getOnlineUsers,
        removeUserChat,
        getFollowingUsers
    }

