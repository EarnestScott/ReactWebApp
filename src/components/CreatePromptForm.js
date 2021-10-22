import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';

function CreatePromptForm(props) {
    const [show, setShow] = useState(false);
    const [prompt, setPrompt] = useState();
    const [response, setResponse] = useState();

    const handleSubmit = async (event) => {
        event.preventDefault();
        const body = { prompt, response };
        const updatedFriendPrompts = await fetch(`http://localhost:3001/friend/${props.id}/prompt`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const updatedFriendPromptsJson = await updatedFriendPrompts.json();
        console.log(updatedFriendPromptsJson);


    };


    return (
        <React.Fragment>
            <Form noValidate validated onSubmit={handleSubmit}>
                <Row>
                    <Form.Group className="mb-3" controlId="prompt">
                        <Form.Label>Prompt</Form.Label>
                        <Form.Control required name={"prompt"} type="text" placeholder="Enter prompt" value={prompt} onChange={e => setPrompt(e.target.value)} />
                    </Form.Group>
                </Row>
                <Row>
                    <Form.Group className="mb-3" controlId="response">
                        <Form.Label>Response</Form.Label>
                        <Form.Control required name={"response"} type="response" placeholder="Enter response" value={response} onChange={e => setResponse(e.target.value)} />

                    </Form.Group>
                </Row>
                <Button variant="primary" type="submit">
                    Submit
                </Button>
            </Form>
        </React.Fragment>
    );
}

export default CreatePromptForm;