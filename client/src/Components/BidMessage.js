import React from 'react';
import { ListGroupItem } from 'react-bootstrap';
import Header from './Header';

const BidMessage = ({ bid }) => {
  return (
    <>
      <Header />
      <ListGroupItem>
        <strong>{bid.user}:</strong> ${bid.amount}
      </ListGroupItem>
    </>
  );
};

export default BidMessage;
