import { useRef, useEffect, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import OrderItem from './components/orderItem';
import { OrderType, OrderMaps, SocketOrder } from './types/orderTypes';
import {
  setBidsOrderBook,
  setAsksOrderBook,
  setBidsOrder,
  setAsksOrder,
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
      dispatch(setBidsOrder(orders));
    },
    [dispatch]
  );
  const updateAsks = useCallback(
    (orders: any) => {
      dispatch(setAsksOrder(orders));
    },
    [dispatch]
  );

  const latestBids = useRef<OrderMaps | null>({});
  const latestAsks = useRef<OrderMaps | null>({});

  const orderBookWorker = useMemo(() => new Worker('./orderbook.js'), []);
  const orderBookEvent = useCallback(() => {
    orderBookWorker.onmessage = ({ data }: any) => {
      setBids(data.d.bids);
      setAsks(data.d.asks);
    };
    orderBookWorker.terminate();
  }, [orderBookWorker, setBids, setAsks]);

  const newOrderWorker = useMemo(() => new Worker('./order.js'), []);

  const throttledSetBids = throttle((newsBids) => {
    updateBids(newsBids);
  }, 1);

  const throttledSetAsks = throttle((newsAsks) => {
    updateAsks(newsAsks);
  }, 1);

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

  const updateNewOrders = useCallback(
    (newOrders: SocketOrder[], initialState: OrderMaps) => {
      return newOrders.reduce(
        (acc, current) => {
          const { p: price, v: amount } = current;

          acc[price] = amount;

          return acc;
        },
        { ...initialState }
      );
    },
    []
  );

  // const removeEmptyOrders = useCallback((current: any) => {
  //   for (const property in current) {
  //     if (!Number(current[property])) {
  //       delete current[property];
  //     }
  //   }
  // }, []);

  const newOrderWorkerEvent = useCallback(() => {
    newOrderWorker.onmessage = ({ data }: any) => {
      if (data.d.bids) {
        // console.log('message : ', ...data.d.bids);
        const updatedOrders = updateNewOrders(
          data.d.bids,
          latestBids.current as OrderMaps
        );
        setNewBids(updatedOrders);
        latestBids.current = null;
        // removeEmptyOrders(latestBids.current);
      }

      if (data.d.asks) {
        // console.log('message : ', ...data.d.asks);
        const updatedOrders = updateNewOrders(
          data.d.asks,
          latestAsks.current as OrderMaps
        );
        setNewAsks(updatedOrders);
        latestAsks.current = null;
        // removeEmptyOrders(latestAsks.current);
      }
    };
  }, [
    newOrderWorker,
    setNewBids,
    setNewAsks,
    updateNewOrders,
    // removeEmptyOrders,
  ]);

  const tradeWorker = useMemo(() => new Worker('./trade.js'), []);

  const tradeWorkerEvent = useCallback(() => {
    tradeWorker.onmessage = ({ data }: any) => {
      // TODO: 체결가 넣어서 위아래 몇프로만 남길것
    };
  }, [tradeWorker]);

  useEffect(() => {
    orderBookEvent();
    return () => {};
  }, [orderBookEvent]);

  useEffect(() => {
    newOrderWorkerEvent();

    return () => {};
  }, [newOrderWorkerEvent]);

  useEffect(() => {
    tradeWorkerEvent();

    return () => {};
  }, [tradeWorkerEvent]);

  return (
    <div>
      <div>asks</div>
      <OrderItem type={OrderType.Asks} />
      <div>bids</div>
      <OrderItem type={OrderType.Bids} />
    </div>
  );
}

export default App;

/*
 16:01 - 16:11 0.1s limit 100  -  터짐
 16:14 - 16:24 0.1s limit 100  -  터짐
 16:25 - 16:33 0.5s limit 100  -  터짐
 14:41 -  0.1s limit 100, current 값에서 0들 제거 로직 적용

 14:46 - 0.001s limit 100 - 
 */

/* 16:34 - 16:47 0.5s limit 100 노렌더링 - 터짐
 18:56 - 20:08 0.5s limit 50 노렌더링 - 터짐
 20:10 - 20:23 0.5s limit 50 노렌더링, setOrder에서 delete 삭제 - 터짐

 */

/* 
 
 object,
 object shape
 
 */
