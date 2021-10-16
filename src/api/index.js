const express = require('express');
const { addAsync } = require('@awaitjs/express');
const bluebird = require('bluebird');
const fetch = require('node-fetch');
const mongoose = require('./odm');
const UserSchema = require('./schemas/UserSchema');
const FriendSchema = require('./schemas/FriendSchema');
const fs = require('fs');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');


const app = express();

const server = addAsync(app);
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(cookieParser());
const port = 3001

let rawdata = fs.readFileSync('config.json');
let config = JSON.parse(rawdata);

server.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
    secret: config.secret,
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false
}))

server.get('/', (req, res) => {
    res.send('Hello World!')
});

server.getAsync('/companyNews', async (req, res, next) => {

    // this should come from db
    const companies = ['tesla', 'apple', 'qualcomm'];
    const companyData = await bluebird.mapSeries(companies, async company => {
        const response = await fetch(`https://newsapi.org/v2/everything?q=${company}&from=2021-10-10&sortBy=popularity&pageSize=1&apiKey=${config.newsApiKey}`)
        const responseJson = await response.json();
        return responseJson;
    });
    const cleanedCompanyData = companyData.map(elem => elem.articles[0]);
    console.log(cleanedCompanyData);
    res.json(cleanedCompanyData);
});
server.postAsync('/user', async (req, res, next) => {
    const { username, password } = req.body;
    const newUser = new UserSchema({ username, password });
    const savedUser = await newUser.save();
    res.json(savedUser);
});
server.getAsync('/user', async (req, res, next) => res.json("hello"));
server.getAsync('/user/:username', async (req, res, next) => {
    const username = req.params.username;
    const foundUser = await UserSchema.findOne({ username });
    res.json(foundUser);
});
server.getAsync('/user/:username/friend', async (req, res, next) => {
    const { username } = req.params;

});
server.postAsync('/friend', async (req, res, next) => {
    const { userid } = req.session;
    const { firstName, lastName } = req.body;
    if (!userid) {
        res.statusCode = 403;
        res.json('Please sign in');
        return;
    }
    if (!firstName || !lastName) {
        res.statusCode = 400;
        res.json('Please submit firstName and lastName');
        return;
    }
    const foundUser = await UserSchema.findOne({ username: userid });
    const createdFriend = await FriendSchema.create({ firstName, lastName });
    foundUser.friends.push(createdFriend);
    await foundUser.save();
    res.json(foundUser);
});
server.postAsync('/login', async (req, res, next) => {
    let session = req.session;
    const { username, password } = req.body;
    if (session.userid) {
        res.json(`You're already logged in ${session.userid}`);
        return;
    }
    if (!username || !password) {
        res.statusCode = 400;
        res.json('Please enter a username and password');
        return;
    }
    const foundUser = await UserSchema.findOne({ username });
    const passwordsMatch = await foundUser?.comparePassword(password);
    let response = passwordsMatch ? foundUser : null;
    if (response) {
        req.session.userid = username;
    }
    res.json(response);

});
server.postAsync('/logout', async (req, res, next) => {
    if (!req.session.userid) {
        res.json('Already logged out!');
        return;
    }
    req.session.destroy();
    res.json('Successfully logged out');
});
//example of using mongoose to interact with db
server.postAsync('/newTank', async (req, res, next) => {
    const schema = new mongoose.Schema({ name: 'string', size: 'string' });
    const Tank = mongoose.model('Tank', schema);
    const creating = await Tank.create({ name: "firstTank", size: "small" });
    res.json(creating);
});

server.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});
