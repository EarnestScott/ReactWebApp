import React from 'react';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
function FriendCard({ firstName, lastName, nickName, _id }) {


    return (
        <>
            <Link to={`/friend/${_id}`} style={{ textDecoration: 'none', color: 'black' }}>
                <Card hoverable>
                    <Card.Body>
                        <Card.Title>{firstName} {lastName}</Card.Title>
                        <Card.Text>
                            {nickName ? `"${nickName}"` : ''}
                        </Card.Text>
                    </Card.Body>
                </Card>
            </Link>
        </>
    );
}

export default FriendCard;