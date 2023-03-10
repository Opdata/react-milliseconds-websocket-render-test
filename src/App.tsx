import { useRef, useEffect, useCallback, useMemo } from 'react';
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

  const orderBookWorker = useMemo(() => new Worker('./orderbook.js'), []);
  const orderBookEvent = useCallback(() => {
    orderBookWorker.onmessage = ({ data }: any) => {
      setBids(data.d.bids);
      setAsks(data.d.asks);
    };
    orderBookWorker.terminate();
  }, [orderBookWorker, setBids, setAsks]);

  useEffect(() => {
    orderBookEvent();
  }, [orderBookEvent]);
  const newOrderWorker = useMemo(() => new Worker('./order.js'), []);

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

  const updateNewOrders = useCallback(
    (newOrders: SocketOrder[], initialState: OrderMaps) => {
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
    },
    []
  );

  const newOrderWorkerEvent = useCallback(() => {
    newOrderWorker.onmessage = ({ data }: any) => {
      if (data.d.bids) {
        const updatedOrders = updateNewOrders(data.d.bids, latestBids.current);
        setNewBids(updatedOrders);
      }

      if (data.d.asks) {
        const updatedOrders = updateNewOrders(data.d.asks, latestAsks.current);
        setNewAsks(updatedOrders);
      }
    };
  }, [newOrderWorker, setNewBids, setNewAsks, updateNewOrders]);

  useEffect(() => {
    orderBookEvent();
  }, [orderBookEvent]);

  useEffect(() => {
    newOrderWorkerEvent();
  }, [newOrderWorkerEvent]);

  // useEffect(() => {
  //   const orderBook = new Worker('./orderbook.js');

  //   const initialOrderBook = ({ data }: any) => {
  //     setBids(data.d.bids);
  //     setAsks(data.d.asks);
  //   };

  //   orderBook.addEventListener('message', initialOrderBook);
  //   orderBook.addEventListener('error', () => {
  //     orderBook.terminate();
  //   });
  //   // TODO:  close시 message인지 close, error인지 이벤트명이 일치하는지 확인해야함
  //   // TODO: 에러가 있을때만 close

  //   return () => {
  //     orderBook.removeEventListener('message', () => {
  //       orderBook.terminate();
  //     });
  //   };
  // }, [setBids, setAsks]);

  // const handleNewOrders = useCallback(
  //   ({ data }: any) => {
  //     if (data.d.bids) {
  //       const updatedOrders = updateNewOrders(data.d.bids, latestBids.current);
  //       setNewBids(updatedOrders);
  //     }

  //     if (data.d.asks) {
  //       const updatedOrders = updateNewOrders(data.d.asks, latestAsks.current);
  //       setNewAsks(updatedOrders);
  //     }
  //   },
  //   [updateNewOrders, setNewBids, setNewAsks]
  // );

  // useEffect(() => {
  //   const newOrder = new Worker('./order.js');

  //   newOrder.addEventListener('message', handleNewOrders);
  //   // TODO: 오더 메시지를 handleNewOrder 코드가 돌아가지만, 이걸 워커에서 돌리는것을 해볼것 이후 워커에서 받을걸 메시지로 받고 그걸 state 업데이트 해보기
  //   newOrder.addEventListener('error', () => {
  //     newOrder.terminate();
  //   });
  //   // TODO:  close시 message인지 close, error인지 이벤트명이 일치하는지 확인해야함
  //   // TODO: 에러가 있을때만 close

  //   return () => {
  //     newOrder.removeEventListener('message', () => {
  //       newOrder.terminate();
  //     });
  //   };
  // }, []);

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
