const express = require('express');
const { addAsync } = require('@awaitjs/express');
const bluebird = require('bluebird');
const fetch = require('node-fetch');
const mongoose = require('./odm');
const fs = require('fs');
const app = addAsync(express());
const port = 3001

let rawdata = fs.readFileSync('config.json');
let config = JSON.parse(rawdata);

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
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
