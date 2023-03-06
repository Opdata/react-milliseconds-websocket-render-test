export enum OrderType {
  Bids = 'bids',
  Asks = 'asks',
}

export interface OrderMaps {
  [price: string]: string | null;
}

export interface SocketOrder {
  p: string;
  v: string;
}
