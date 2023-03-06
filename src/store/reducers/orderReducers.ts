import { createReducer } from '@reduxjs/toolkit';
import {
  setBidsOrderBook,
  setAsksOrderBook,
  addBidsOrder,
  addAsksOrder,
} from '../actions/orderActions';
import { OrderMaps } from '../../types/orderTypes';

export interface Payload {
  price: string;
  amount: number;
}

const initialBids = {} as OrderMaps;
const initialAsks = {} as OrderMaps;

export const bidsReducer = createReducer(initialBids, (builder) => {
  builder
    .addCase(setBidsOrderBook, (state, action: any) => {
      const parseObject: any = {};
      for (let i = 0; i < action.payload.length; i++) {
        parseObject[action.payload[i].p] = action.payload[i].v;
      }
      return parseObject;
    })
    .addCase(addBidsOrder, (state, action: any) => {
      // console.log('action.payload price , amount', action);
      // state[action.payload.price] = String(action.payload.amount);
      const keys = Object.keys(action.payload);
      for (let i = 0; i < keys.length; i++) {
        // console.log('action.payload[keys[i]] : ', action.payload[keys[i]]);
        state[keys[i]] = action.payload[keys[i]];
      }
    });
});

export const asksReducer = createReducer(initialAsks, (builder) => {
  builder
    .addCase(setAsksOrderBook, (state, action: any) => {
      const parseObject: any = {};
      for (let i = 0; i < action.payload.length; i++) {
        parseObject[action.payload[i].p] = action.payload[i].v;
      }
      return parseObject;
    })
    .addCase(addAsksOrder, (state, action: any) => {
      // console.log('action.payload price , amount', action);
      // state[action.payload.price] = String(action.payload.amount);
      const keys = Object.keys(action.payload);
      for (let i = 0; i < keys.length; i++) {
        // console.log('action.payload[keys[i]] : ', action.payload[keys[i]]);
        state[keys[i]] = action.payload[keys[i]];
      }
    });
});
