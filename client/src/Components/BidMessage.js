import React from 'react';
import { ListGroupItem } from 'react-bootstrap';

const BidMessage = ({ bid }) => {
  return (
    <ListGroupItem>
      <strong>{bid.user}:</strong> ${bid.amount}
    </ListGroupItem>
  );
};

export default BidMessage;
