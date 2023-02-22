import { memo, useMemo, useCallback } from 'react';
import { useRecoilState } from 'recoil';
import { bidsState, asksState } from '../store/atoms/orderAtoms';
import { OrderType, OrderMaps } from '../types/orderTypes';
import { throttle, drop, dropRight, reduce } from 'lodash';
import OrderItem from './orderItem';

interface OrderGridProps {
  type: OrderType;
  orders: OrderMaps;
}

const ITEMS_TO_RENDER_PER_BOOK = 15;

const OrderGrid = ({ type, orders }: OrderGridProps) => {
  //   console.log('orders : ', orders);
  const partialOrder = useMemo(() => new Worker('./order.js'), []);
  const [bids, setBids] = useRecoilState(bidsState);
  const [asks, setAsks] = useRecoilState(asksState);
  const ordersIds = useMemo(() => {
    const prices = Object.keys(orders);
    const sortedPrices = prices.sort((a, b) => Number(b) - Number(a));
    const dropFunction = type === OrderType.Ask ? drop : dropRight; // lodash drop, dropRight 찾아야함

    return dropFunction(
      sortedPrices,
      sortedPrices.length - ITEMS_TO_RENDER_PER_BOOK
    );
  }, [type, orders]);

  const ordersTotalMap = useMemo(() => {
    // 확인필요
    // console.log('ordersToRender : ', ordersToRender);
    const priceList =
      type === OrderType.Ask ? [...ordersIds].reverse() : ordersIds;
    // console.log('priceList : ', priceList);
    return reduce(
      priceList,
      (acc, current, index, ordersList) => {
        // console.log('acc : ', acc);
        // console.log('current : ', current);
        // console.log('index : ', index);
        // console.log('ordersList : ', ordersList);
        const previousPrice: number = Number(ordersList[Number(index) - 1]);
        // console.log('previousPrice : ', Number(ordersList[Number(index) - 1]));
        const previousTotal: number = acc.get(previousPrice) || 0;
        // console.log('previousTotal : ', acc.get(previousPrice) || 0);
        // console.log('Number(current) : ', Number(current));
        // console.log('orders : ', orders);
        // console.log('orders[Number(current)] : ', orders[Number(current)]);
        acc.set(
          Number(current),
          previousTotal + Number(orders[Number(current)])
        );
        // console.log(
        //   'previousTotal + orders[Number(current)] : ',
        //   previousTotal + Number(orders[Number(current)])
        // );

        return acc;
      },
      new Map()
    );
  }, [type, ordersIds, orders]);

  const addNewOrder = useCallback(
    (newOrders: { p: string; v: string }[], initialOrders: OrderMaps) => {
      //   console.log('initialOrders : ', initialOrders);
      return newOrders.reduce(
        (acc, current) => {
          //   console.log('acc : ', acc);
          //   console.log('current : ', current);
          const { p: price, v: value } = current;

          //   if (!acc[Number(price)]) {
          //     console.log('없음');
          //   }

          //   console.log('Number(value) === 0 :', Number(value) === 0);
          //   if (Number(value) === 0) {
          //     console.log('수량이 0 이니까 삭제 필요');
          //   }

          if (Number(value) === 0) {
            delete acc[Number(price)];
          }

          //   console.log('Number(value) > 0 :', Number(value) > 0);
          //   if (Number(value) > 0) {
          //     console.log('없으면서 삽입 필요');
          //   }

          if (Number(value) > 0) {
            // acc[Number(p)] = v;
            acc[price] = value;
          }
          //   console.log('최종 acc : ', acc);
          return acc;
        },
        { ...initialOrders }
      );
    },
    []
  );

  const throttledSetBids = useCallback(
    throttle((newsBids) => setBids(() => newsBids), 10000),
    [setBids]
  );

  const throttledSetAsks = useCallback(
    throttle((newsAsks) => setAsks(() => newsAsks), 10000),
    [setAsks]
  );

  //   const throttledSetBids = throttle(updateBids, 10000);
  //   const throttledSetAsks = throttle(updateAsks, 200);

  const setNewBids = useCallback(
    (newBids: OrderMaps) => {
      const latestBids = newBids;
      throttledSetBids(latestBids);
    },
    [throttledSetBids]
  );

  const setNewAsks = useCallback(
    (newAsks: OrderMaps) => {
      const latestAsks = newAsks;
      throttledSetAsks(latestAsks);
    },
    [throttledSetAsks]
  );

  const updatePartialOrder = useCallback(
    ({ data }: any) => {
      // console.log('message : ', data);
      //   if (!data.d.bids.length) {
      //     console.log('message : ', data);
      //   }

      const prevBidOrders = data.d.bids ?? [];
      const prevAskOrders = data.d.asks ?? [];

      //   console.log('prevBidOrders : ', prevBidOrders);

      if (!Object.entries(asks).length || !Object.entries(bids).length) {
        return;
      }

      // if (prevBidOrders.length > 1 || prevAskOrders.length > 1) {
      //   console.log('bids : ', data.d.bids);
      //   console.log('asks : ', data.d.asks);
      // }

      const newBidOrdersMap = addNewOrder(prevBidOrders, bids);
      const newAskOrdersMap = addNewOrder(prevAskOrders, asks);

      // console.log('newBidOrdersMap : ', newBidOrdersMap);
      // console.log('newAskOrdersMap : ', newAskOrdersMap);

      setNewBids(newBidOrdersMap);
      setNewAsks(newAskOrdersMap);
      //   console.log('update 종료');
    },
    [addNewOrder, bids, asks, setNewBids, setNewAsks]
  );

  partialOrder.addEventListener('message', updatePartialOrder);
  //   TODO: Close시 재핑
  partialOrder.addEventListener('error', () => {
    partialOrder.terminate();
  });

  //   console.log('bids : ', bids);

  return (
    <div>
      {ordersIds.map((price) => {
        const parsedPrice = Number(price);
        const value = ordersTotalMap.get(parsedPrice) || 0;
        // console.log('parsedPrice : ', parsedPrice);
        // console.log('ordersTotalMap : ', ordersTotalMap);
        // console.log('value : ', value);

        return <OrderItem key={price} price={price} value={value} />;
      })}
    </div>
  );
};
export default memo(OrderGrid);
