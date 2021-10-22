import React from 'react';
import Card from 'react-bootstrap/Card';

function FriendCard({ firstName, lastName, nickName }) {

    return (
        <>
            <Card>
                <Card.Body>
                    <Card.Title>{firstName} {lastName}</Card.Title>
                    <Card.Text>
                        {nickName ? `"${nickName}"` : ''}
                    </Card.Text>
                </Card.Body>
            </Card>
        </>
    );
}

export default FriendCard;