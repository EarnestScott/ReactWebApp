import React, { useState, useEffect } from 'react';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FriendCard from './FriendCard';

function FriendHome() {
    const [friends, setFriends] = useState([]);

    useEffect(() => {
        async function fetchData() {
            const fetchFriends = await fetch('http://localhost:3001/friends', {
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });
            const fetchFriendsJson = await fetchFriends.json();
            console.log(fetchFriendsJson);
            // assuming it's an array
            if (fetchFriendsJson.length) {
                setFriends(fetchFriendsJson);
            }
        }
        if (friends.length === 0) fetchData();
    });
    return (
        <>
            <h1>
                Friends
            </h1>
            <Container>
                <Row>
                    {friends && friends.map((props) => <Col><FriendCard {...props} ></FriendCard></Col>)}
                </Row>
            </Container>
        </>
    );
}

export default FriendHome;