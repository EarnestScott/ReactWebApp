const mongoose = require('mongoose');
const fs = require('fs');

let rawdata = fs.readFileSync('config.json');
let config = JSON.parse(rawdata);
const { user, password, database } = config;
const uri = `mongodb+srv://${user}:${password}@cluster0.kydyz.mongodb.net/${database}?retryWrites=true&w=majority`;
mongoose.connect(uri).catch(err => console.log(err));

module.exports = mongoose;