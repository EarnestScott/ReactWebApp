const express = require('express');
const { addAsync } = require('@awaitjs/express');
const bluebird = require('bluebird');
const fetch = require('node-fetch');
const mongoose = require('./odm')();
// const mongoose = require('mongoose');
const cors = require('cors');
// const passport = require('passport');
// const LocalStategy = require('passport-local');
// const passportLocalMongoose = require('passport-local-mongoose');
// // console.log(mongoose);
// const mongoose.models.User = require('./schemas/mongoose.models.User');
// const mongoose.models.Friend = require('./schemas/mongoose.models.Friend');
const fs = require('fs');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const session = require('express-session');
const MongoStore = require('connect-mongo');

let rawdata = fs.readFileSync('config.json');
let config = JSON.parse(rawdata);

const { user, password, database } = config;
const uri = `mongodb+srv://${user}:${password}@cluster0.kydyz.mongodb.net/${database}?retryWrites=true&w=majority`;
// mongoose.connect(uri).then(() => store = MongoStore.create({
//     // mongoUrl: uri,    // uri: mongoose.connection,
//     client: mongoose.connection,
//     collection: 'Sessions',
//     autoRemove: 'native',

// }));

// mongoose.model('User', require('./schemas/UserSchema'));
// mongoose.model('Friend', require('./schemas/FriendSchema'));
// const clientP = mongoose.connect(
//     uri,
//     { useNewUrlParser: true, useUnifiedTopology: true }
// ).then(m => m.connection.getClient())

const app = addAsync(express());
const oneDay = 1000 * 60 * 60 * 24;

const store = MongoStore.create({
    mongoUrl: uri,    // uri: mongoose.connection,
    // client: mongoose.connection,
    collection: 'Sessions',
    autoRemove: 'native',
    stringify: false

});

// store.on('error', function (error) {
//     console.log(error);
// });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
// app.use(session({
//     secret: 'foo',
//     resave: false,
//     saveUninitialized: false,
//     store: MongoStore.create({
//         clientPromise: clientP,
//         stringify: false,
//         autoRemove: 'interval',
//         autoRemoveInterval: 1,
//         collection: 'sessions'
//     })
// }));

// app.use(passport.initialize());
// app.use(passport.session());
const port = 3001


app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// const sessionInit = (client) => {
//     app.use(
//         session({
//             store: MongoStore.create({
//                 client: client,
//                 mongoOptions: {
//                     useNewUrlParser: true,
//                     useUnifiedTopology: true,
//                 },
//             }),
//             secret: config.secret,
//             collection: 'sessions',
//             resave: false,
//             saveUninitialized: false,
//             cookie: { maxAge: oneDay },
//         })
//     )
// }

app.use(session({
    secret: config.secret,
    // don't create session if unmodified
    saveUninitialized: false,
    cookie: { maxAge: oneDay, secure: false },
    // don't save session if unmodified
    resave: false,
    // store
}));
app.use(cors({ credentials: true, origin: true }));

const authMiddleware = (req, res, next) => {

    console.log(req.session);
    const { userid } = req.session;
    console.log(userid);
    if (!userid) {
        res.statusCode = 401;
        next("Unauthorized to access resource, please login first");
    }
    next();
}
app.use(function (req, res, next) {
    console.log("midd");
    console.log(req.session)
    if (req.session && req.session.userid) {
        mongoose.models.User.findOne({ username: req.session.userid }, function (err, user) {
            if (!err && user) {
                req.user = user;
                next();
            } else {
                next(new Error('Could not restore User from Session.'));
            }
        });
    } else {
        next();
    }
});

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
app.getAsync('/friends', async (req, res, next) => {
    let session = req.session;
    console.log(session.id);
    console.log(session);
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
app.postAsync('/login', async (req, res, next) => {
    let session = req.session;
    console.log(session)
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
        // const userSession = await mongoose.models.Sessions.findOne({});
        const userSession = await mongoose.collection('sessions').findOne({ 'session.userid': username });
        console.log("user session");
        console.log(userSession);
        req.session.cookie = userSession.session.cookie;
        req.session.userid = userSession.session.userid
        // req.session.save();
        res.send(req.session);
        // req.session.save(err => console.log(err));
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
