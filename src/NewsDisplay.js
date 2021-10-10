import React, { Component } from 'react';
import bluebird from 'bluebird';
import Card from 'react-bootstrap/Card';
import fs from 'fs';
const rawData = fs.readFileSync('../config.json');
const config = JSON.parse(rawData);
class NewsDisplay extends Component {
    constructor(props) {
        super(props);
        this.state = {
            companyData: null
        }
    }

    async componentDidMount() {
        this.setState({ companyData: await this.getCompanyData() });
    }
    async getCompanyData() {
        const companies = ['tesla', 'apple', 'qualcomm'];
        const companyData = await bluebird.mapSeries(companies, async company => {
            const response = await fetch(`https://newsapi.org/v2/everything?q=${company}&from=2021-10-10&sortBy=popularity&pageSize=1&apiKey=${config.newsApiKey}`)
            const responseJson = await response.json();
            return responseJson;
        });
        const cleanedCompanyData = companyData.map(elem => elem.articles[0]);
        console.log(cleanedCompanyData);
        return cleanedCompanyData;
    }
    render() {
        const { companyData } = this.state;
        return (
            <div>
                {companyData && companyData.map(({ title, description, urlToImage }) => <Card style={{ width: '18rem' }}>
                    <Card.Img variant="top" style={{ width: 50, height: 50 }} src={urlToImage} />
                    <Card.Body>
                        <Card.Title>{title}</Card.Title>
                        <Card.Text>
                            {description}
                        </Card.Text>
                        {/* <Button variant="primary">Go somewhere</Button> */}
                    </Card.Body>
                </Card>)}
            </div>

        );
    }
}

export default NewsDisplay;