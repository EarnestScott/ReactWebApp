import React, { Component } from 'react';
import bluebird from 'bluebird';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

// import * as fs from 'fs';
// const rawData = fs.readFileSync('../config.json');
// const config = JSON.parse(rawData);
class NewsDisplay extends Component {
    constructor(props) {
        super(props);
        this.state = {
            companyData: null
        }
    }

    async componentDidMount() {
        // this.setState({ companyData: await this.getCompanyData() });
    }
    async getCompanyData() {
        const companies = ['tesla', 'apple', 'qualcomm'];
        const companyData = await bluebird.mapSeries(companies, async company => {
            const response = await fetch(`https://newsapi.org/v2/everything?q=${company}&from=2021-10-10&sortBy=popularity&pageSize=1&apiKey=`)
            const responseJson = await response.json();
            return responseJson;
        });
        const cleanedCompanyData = companyData.map(elem => elem.articles[0]);
        console.log(cleanedCompanyData);
        return cleanedCompanyData;
    }

    render() {

        const { companyData } = this.state;
        const displayCompanyData = companyData?.map(({ title, description, urlToImage }) =>
            <Col>
                <Card className={"mb-2"} border={"dark"} bg={"light"} style={{ width: '18rem' }}>
                    <Card.Img variant="top" src={urlToImage} />
                    <Card.Body>
                        <Card.Title>{title}</Card.Title>
                        <Card.Text>
                            {description}
                        </Card.Text>
                        {/* <Button variant="primary">Go somewhere</Button> */}
                    </Card.Body>
                </Card>
            </Col>)
        return (
            <React.Fragment>
                <Container>
                    {companyData && <Row>
                        {displayCompanyData}
                    </Row>}
                </Container>

            </React.Fragment>

        );
    }
}

export default NewsDisplay;