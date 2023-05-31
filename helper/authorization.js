const random = require('random')
const db = require("../models");
const sequelize = require("sequelize");
const User = db.users;

module.exports = {
    generateUsername: (emailAddress) => {
        let username = emailAddress.split('@');
        return checkUsername(username[0].replace(/.[^\w\s]/gi, ''));
    },
    between:(min, max) => {
        return Math.floor(
          Math.random() * (max - min) + min
        )
      }
};
async function checkUsername(username) {
    let userdata =  await User.findOne({where:{ name: username}});
    if(userdata == null) {
        console.log(username);
        return username;
    } else {
        checkUsername(username + random.int(1000,9999));
    }
}
