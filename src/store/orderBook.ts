import { configureStore } from '@reduxjs/toolkit';
import { bidsReducer, asksReducer } from './reducers/orderReducers';

const reducer = {
  bids: bidsReducer,
  asks: asksReducer,
};

const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }),
});

export default store;
