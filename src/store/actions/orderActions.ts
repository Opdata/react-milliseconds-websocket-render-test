import { createAction } from '@reduxjs/toolkit';
import { Payload } from '../reducers/orderReducers';

const setBidsOrderBook = createAction<Payload>('bids/bidsOrderBook');
const setAsksOrderBook = createAction<Payload>('asks/asksOrderBook');
const addBidsOrder = createAction<Payload>('bids/addBids');
const addAsksOrder = createAction<Payload>('asks/addAsks');

export { setBidsOrderBook, setAsksOrderBook, addBidsOrder, addAsksOrder };
