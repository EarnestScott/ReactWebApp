import React, { useState, useEffect } from 'react';
import { useParams, Redirect } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function FriendDetails() {
    const [friend, setFriend] = useState({});
    const { id } = useParams();
    const { firstName, lastName, nickName, prompts } = friend;

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
                //handle redirect to safety
            }
        }
        fetchFriend();
    })

    return (
        <Container>
            <h2 className={'mt-4'}>{firstName} {nickName} {lastName}</h2>
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
        </Container>
    );
}

export default FriendDetails;