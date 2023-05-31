const db = require("../models");
module.exports = {
    current_timestamp: function () {
        return Math.floor(Date.now() / 1000);
    }
};
