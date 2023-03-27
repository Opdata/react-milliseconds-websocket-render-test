import { createReducer } from '@reduxjs/toolkit';
import {
  setBidsOrderBook,
  setAsksOrderBook,
  setBidsOrder,
  setAsksOrder,
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
      for (let i = 0; i < action.payload.length; i++) {
        state[action.payload[i].p] = action.payload[i].v;
      }
    })
    .addCase(setBidsOrder, (state, action: any) => {
      // const empty: any = { ...state };
      // for (const property in action.payload) {
      //   empty[property] = action.payload[property];
      // }
      // for (const property in action.payload) {
      //   if (!Number(action.payload[property])) {
      //     delete empty[property];
      //   }
      // }
      // return { ...empty };

      for (const property in action.payload) {
        if (!Number(action.payload[property])) {
          delete state[property];
          continue;
        }

        state[property] = action.payload[property];
      }
    });
});

export const asksReducer = createReducer(initialAsks, (builder) => {
  builder
    .addCase(setAsksOrderBook, (state, action: any) => {
      for (let i = 0; i < action.payload.length; i++) {
        state[action.payload[i].p] = action.payload[i].v;
      }
    })
    .addCase(setAsksOrder, (state, action: any) => {
      // const empty: any = { ...state };
      // for (const property in action.payload) {
      //   empty[property] = action.payload[property];
      // }
      // for (const property in action.payload) {
      //   if (!Number(action.payload[property])) {
      //     delete empty[property];
      //   }
      // }
      // return { ...empty };

      for (const property in action.payload) {
        if (!Number(action.payload[property])) {
          delete state[property];
          continue;
        }
        state[property] = action.payload[property];
      }
    });
});
