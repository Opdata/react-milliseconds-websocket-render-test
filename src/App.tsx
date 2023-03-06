import { useRef, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import ItemsGrid from './components/orderGrid';
import { OrderType, OrderMaps, SocketOrder } from './types/orderTypes';
import {
  setBidsOrderBook,
  setAsksOrderBook,
  addBidsOrder,
  addAsksOrder,
} from './store/actions/orderActions';
import { throttle } from 'lodash';

function App() {
  const dispatch = useDispatch();
  const setBids = useCallback(
    (orders: any) => dispatch(setBidsOrderBook(orders)),
    [dispatch]
  );
  const setAsks = useCallback(
    (orders: any) => dispatch(setAsksOrderBook(orders)),
    [dispatch]
  );
  const updateBids = useCallback(
    (orders: any) => {
      dispatch(addBidsOrder(orders));
    },
    [dispatch]
  );
  const updateAsks = useCallback(
    (orders: any) => {
      dispatch(addAsksOrder(orders));
    },
    [dispatch]
  );

  const latestBids = useRef<OrderMaps>({});
  const latestAsks = useRef<OrderMaps>({});

  useEffect(() => {
    const orderBook = new Worker('./orderbook.js');

    const initialOrderBook = ({ data }: any) => {
      setBids(data.d.bids);
      setAsks(data.d.asks);
    };

    orderBook.addEventListener('message', initialOrderBook);
    orderBook.addEventListener('error', () => {
      orderBook.terminate();
    });
    // TODO:  close시 message인지 close, error인지 이벤트명이 일치하는지 확인해야함
    // TODO: 에러가 있을때만 close

    return () => {
      orderBook.removeEventListener('message', () => {
        orderBook.terminate();
      });
    };
  }, [setBids, setAsks]);

  const updateNewOrders = (
    newOrders: SocketOrder[],
    initialState: OrderMaps
  ) => {
    return newOrders.reduce(
      (acc, current) => {
        const { p: price, v: amount } = current;
        if (Number(amount) === 0) {
          acc[price] = null;
        }

        if (Number(amount) > 0) {
          acc[price] = amount;
        }
        return acc;
      },
      { ...initialState }
    );
  };

  const throttledSetBids = throttle((newsBids) => {
    updateBids(newsBids);
  }, 100);

  const throttledSetAsks = throttle((newsAsks) => {
    updateAsks(newsAsks);
  }, 100);

  const setNewBids = useCallback(
    (newBids: OrderMaps) => {
      latestBids.current = newBids;
      throttledSetBids(latestBids.current);
    },
    [throttledSetBids]
  );

  const setNewAsks = useCallback(
    (newAsks: OrderMaps) => {
      latestAsks.current = newAsks;
      throttledSetAsks(latestAsks.current);
    },
    [throttledSetAsks]
  );

  useEffect(() => {
    const newOrder = new Worker('./order.js');

    const handleNewOrders = ({ data }: any) => {
      if (data.d.bids) {
        const updatedOrders = updateNewOrders(data.d.bids, latestBids.current);
        setNewBids(updatedOrders);
      }

      if (data.d.asks) {
        const updatedOrders = updateNewOrders(data.d.asks, latestAsks.current);
        setNewAsks(updatedOrders);
      }
    };

    newOrder.addEventListener('message', handleNewOrders);
    newOrder.addEventListener('error', () => {
      newOrder.terminate();
    });
    // TODO:  close시 message인지 close, error인지 이벤트명이 일치하는지 확인해야함
    // TODO: 에러가 있을때만 close

    return () => {
      newOrder.removeEventListener('message', () => {
        newOrder.terminate();
      });
    };
  }, [setNewBids, setNewAsks]);

  return (
    <div>
      <div>bids</div>
      <ItemsGrid type={OrderType.Bids} />
      <div>asks</div>
      <ItemsGrid type={OrderType.Asks} />
    </div>
  );
}

export default App;
