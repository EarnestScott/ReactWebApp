const express = require('express');
const { addAsync } = require('@awaitjs/express');
const bluebird = require('bluebird');
const fetch = require('node-fetch');
const mongoose = require('./odm')();
const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const session = require('express-session');
const MongoStore = require('connect-mongo');

let rawdata = fs.readFileSync('config.json');
let config = JSON.parse(rawdata);

const { user, password, database } = config;
const uri = `mongodb+srv://${user}:${password}@cluster0.kydyz.mongodb.net/${database}?retryWrites=true&w=majority`;

const app = addAsync(express());
const oneDay = 1000 * 60 * 60 * 24;

const store = MongoStore.create({
    mongoUrl: uri,
    collection: 'Sessions',
    autoRemove: 'native',
    stringify: false

});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
const port = 3001


app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(session({
    secret: config.secret,
    // don't create session if unmodified
    saveUninitialized: false,
    cookie: { maxAge: oneDay, secure: false },
    // don't save session if unmodified
    resave: false,
    store
}));
app.use(cors({ credentials: true, origin: true }));

const authMiddleware = (req, res, next) => {

    const { userid } = req.session;
    if (!userid) {
        res.statusCode = 401;
        next("Unauthorized to access resource, please login first");
    }
    next();
}

app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.getAsync('/companyNews', async (req, res, next) => {

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
app.postAsync('/user', async (req, res, next) => {
    const { username, password } = req.body;
    const newUser = new mongoose.models.User({ username, password });
    const savedUser = await newUser.save();
    res.json(savedUser);
});
app.getAsync('/user', async (req, res, next) => res.json("hello"));
app.getAsync('/user/:username', async (req, res, next) => {
    const username = req.params.username;
    const foundUser = await mongoose.models.User.findOne({ username });
    res.json(foundUser);
});
app.getAsync('/friends', authMiddleware, async (req, res, next) => {
    const { userid } = req.session;
    console.log(userid);
    const foundUserAndFriends = await mongoose.models.User.findOne({ username: userid }).populate('friends');
    res.json(foundUserAndFriends.friends);


});
app.postAsync('/friend', authMiddleware, async (req, res, next) => {
    const { userid } = req.session;
    const { firstName, lastName } = req.body;
    if (!firstName || !lastName) {
        res.statusCode = 400;
        res.json('Please submit firstName and lastName');
        return;
    }
    const foundUser = await mongoose.models.User.findOne({ username: userid });
    const createdFriend = await mongoose.models.Friend.create({ firstName, lastName });
    foundUser.friends.push(createdFriend);
    await foundUser.save();
    res.json(foundUser);
});

app.getAsync('/friend/:id', authMiddleware, async (req, res, next) => {
    const { id } = req.params;
    const foundFriend = await mongoose.models.Friend.findById(id).exec();
    res.json(foundFriend);
});
// var comment = post.comments.id(my_id);
// comment.author = 'Bruce Wayne';

// post.save(function (err) {
//     // emmbeded comment with author updated     
// });
app.postAsync('/friend/:id/prompt', authMiddleware, async (req, res, next) => {
    const { prompt, response } = req.body;
    const { id } = req.params;
    console.log(prompt, response);
    const foundFriend = await mongoose.models.Friend.findById(id).exec();
    if (foundFriend) {
        foundFriend.prompts.push({ prompt, response });
        await foundFriend.save();
    }
    res.json(foundFriend);
});

app.postAsync('/login', async (req, res, next) => {
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
    const foundUser = await mongoose.models.User.findOne({ username });
    const passwordsMatch = await foundUser?.comparePassword(password);
    if (foundUser && passwordsMatch) {
        req.session.userid = username;
        res.send(req.session);
    }
    else {
        res.json(null);
    }
});
app.postAsync('/logout', async (req, res, next) => {
    if (!req.session.userid) {
        res.json('Already logged out!');
        return;
    }
    req.session.destroy(err => {
        if (err) throw new Error(err);
        else res.json('Successfully logged out');
    });
});
//example of using mongoose to interact with db
app.postAsync('/newTank', async (req, res, next) => {
    const schema = new mongoose.Schema({ name: 'string', size: 'string' });
    const Tank = mongoose.model('Tank', schema);
    const creating = await Tank.create({ name: "firstTank", size: "small" });
    res.json(creating);
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});
