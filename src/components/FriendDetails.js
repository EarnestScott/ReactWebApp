import React, { useState, useEffect } from 'react';
import { useParams, Redirect, useHistory } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import CreatePromptForm from './CreatePromptForm';

function FriendDetails() {
    const [friend, setFriend] = useState({});
    const [displayForm, setDisplayForm] = useState(false);
    const { id } = useParams();
    const { firstName, lastName, nickName, prompts } = friend;
    const history = useHistory();
    useEffect(() => {
        async function fetchFriend() {
            const fetchFriend = await fetch(`http://localhost:3001/friend/${id}`, {
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });

            if (Object.keys(friend).length > 0) return;
            const fetchFriendJson = await fetchFriend.json();
            console.log(fetchFriendJson);
            if (fetchFriendJson) {
                setFriend(fetchFriendJson);
            }
            else {
                history.push('/');
            }
        }
        fetchFriend();
    });
    const toggleForm = () => {
        setDisplayForm(!displayForm);
    }

    return (
        <Container>
            <h2 className={'mt-4'}>{firstName} {nickName} {lastName}</h2>
            <br />
            <br />
            <h4 style={{ float: 'left' }}>Prompts: </h4>
            <Row className={'m-2'} md={2}>
                {prompts?.length > 0 && prompts.map(({ prompt, response }) => (
                    <Col>
                        <Card>
                            <Card.Header>{prompt}</Card.Header>
                            <Card.Body>{response}</Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
            <br />
            <br />
            <Row>
                <Button variant="primary" onClick={() => toggleForm()}>Create new prompt</Button>
            </Row>
            <br />
            <br />
            {displayForm && <CreatePromptForm id={id} />}
        </Container>
    );
}

export default FriendDetails;