export enum OrderType {
  Bid = 'bid',
  Ask = 'ask',
}

export interface OrderMaps {
  [price: string]: string;
}
