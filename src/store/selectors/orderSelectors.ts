export const getBids = (state: any) => state.bids;
export const getAsks = (state: any) => state.asks;
export const selectBid = (id: any, state: any) => state.bids[id];
export const selectAsk = (id: any, state: any) => state.asks[id];
