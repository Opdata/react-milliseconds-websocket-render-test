import { createAction } from '@reduxjs/toolkit';
import { Payload } from '../reducers/orderReducers';

const setBidsOrderBook = createAction<Payload>('bids/bidsOrderBook');
const setAsksOrderBook = createAction<Payload>('asks/asksOrderBook');
const setBidsOrder = createAction<Payload>('bids/setBids');
const setAsksOrder = createAction<Payload>('asks/setAsks');

export { setBidsOrderBook, setAsksOrderBook, setBidsOrder, setAsksOrder };
