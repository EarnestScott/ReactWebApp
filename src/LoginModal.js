import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Toast from 'react-bootstrap/Toast';
import { useHistory } from "react-router-dom";

function LoginModal() {
    const [show, setShow] = useState(false);
    const [validated, setValidated] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [formFeedback, setFormFeedback] = useState('Hello');
    const history = useHistory();



    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.stopPropagation();
        }
        setValidated(true);

        const body = { username, password };
        const loginRequest = await fetch('http://localhost:3001/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })
        const loginRequestJson = await loginRequest.json();
        // alert(loginRequestJson);
        if (loginRequestJson) {
            setValidated(true);
            const path = `/about`;
            history.push(path);
            setShowToast(true);
            handleClose();
        }
        else {
            setUsername('');
            setPassword('');
            setValidated(false);
        }


    };
    const handleUsername = (e) => e && setUsername(e.target.value);
    const handlePassword = (e) => e && setPassword(e.target.value);

    return (
        <React.Fragment>
            <Button variant="primary" onClick={handleShow}>
                Login
            </Button>
            {/* <Toast style={{ zIndex: 1 }} show={showToast} delay={3000} animation autohide>
                <Toast.Header>
                    Login successful!
                </Toast.Header>
            </Toast> */}
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Welcome back!</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form noValidate validated onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="username">
                            <Form.Label>Username</Form.Label>
                            <Form.Control required name={"username"} type="text" placeholder="Enter username" value={username} onChange={handleUsername} />
                            <Form.Control.Feedback type={"invalid"}>Please enter valid username</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control required name={"password"} type="password" placeholder="Password" value={password} onChange={handlePassword} />
                            <Form.Control.Feedback type={"invalid"}>Please enter valid password</Form.Control.Feedback>

                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Submit
                        </Button>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" type="submit" onClick={handleSubmit}>
                        Login
                    </Button>
                </Modal.Footer>
            </Modal>
        </React.Fragment>
    );
}

export default LoginModal;