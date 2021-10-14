import React, { Component } from 'react';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

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
        const companyData = await fetch('http://localhost:3001/companyNews');
        return await companyData.json();
    }

    render() {

        const { companyData } = this.state;
        const displayCompanyData = companyData?.map(({ title, description, urlToImage }, idx) =>
            <Col key={idx}>
                <Card className={"mb-2 mt-4 h-100"} border={"dark"} bg={"light"} style={{ width: '18rem' }}>
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