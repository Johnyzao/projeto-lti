import React from 'react';
import { ListGroupItem } from 'react-bootstrap';

const BidMessage = ({ bid }) => {
  const textStyle = {
    color: bid.user === 'Você' ? 'green' : 'inherit', // Green color for 'você', default color otherwise
  };

  return (
    <>
      <ListGroupItem>
        <strong style={textStyle}>{bid.user}:</strong> {bid.amount}€
      </ListGroupItem>
    </>
  );
};

export default BidMessage;
