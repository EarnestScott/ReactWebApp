import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import logo from './logo.svg';
import { Switch, Route, Link } from 'react-router-dom';
import Home from './Home';
import LoginModal from './LoginModal';
import About from './About';
function NavbarComponent() {
    return (
        <React.Fragment>
            <Navbar bg="dark" variant="dark">
                <Container>
                    <Navbar.Brand href="#home">
                        <img
                            alt=""
                            src={logo}
                            width="30"
                            height="30"
                            className="d-inline-block align-top"
                        />{' '}
                        Earnest's Website
                    </Navbar.Brand>
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to={"/"} >Home</Nav.Link>

                        <Nav.Link as={Link} to={"/about"}>About Us</Nav.Link>
                    </Nav>
                    <Nav>
                        <Nav.Link style={{ float: "right" }} as={LoginModal} >Login</Nav.Link>
                    </Nav>
                </Container>
            </Navbar >
            <Switch>
                <Route exact path='/' component={Home} />
                <Route path='/about' component={About} />
                {/* <Route exact path='/login' component={LoginModal} /> */}
                <Route render={function () {
                    return <p>Not found</p>
                }} />
            </Switch>
        </React.Fragment>

    );
}

export default NavbarComponent;
