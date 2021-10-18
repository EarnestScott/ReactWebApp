const mongoose = require('mongoose');
const fs = require('fs');

let rawdata = fs.readFileSync('config.json');
let config = JSON.parse(rawdata);
const { user, password, database } = config;
const uri = `mongodb+srv://${user}:${password}@cluster0.kydyz.mongodb.net/${database}?retryWrites=true&w=majority`;
// mongoose.connect(uri).catch(err => console.log(err));

module.exports = function connectionFactory() {
    // const conn = mongoose.createConnection(uri);
    const conn = mongoose.createConnection(uri);
    // const conn = mongoose.connect(uri);

    conn.model('User', require('./schemas/UserSchema'));
    conn.model('Friend', require('./schemas/FriendSchema'));

    return conn;
};

// module.exports = mongoose;