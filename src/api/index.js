const express = require('express');
const { addAsync } = require('@awaitjs/express');
const bluebird = require('bluebird');
const fetch = require('node-fetch');
const mongoose = require('./odm');
const UserSchema = require('./UserSchema');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const server = addAsync(app);
const port = 3001

let rawdata = fs.readFileSync('config.json');
let config = JSON.parse(rawdata);

server.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

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
})
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
