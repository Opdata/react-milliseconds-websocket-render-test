// @ts-nocheck
import { memo, useMemo } from 'react';
import { OrderType } from '../types/orderTypes';
import OrderItem from './orderItem';
import { useSelector, shallowEqual } from 'react-redux';
import { getBids, getAsks } from '../store/selectors/orderSelectors';

interface OrderGridProps {
  type: OrderType;
}

const OrderGrid = ({ type }: OrderGridProps) => {
  const state = useSelector(
    type === OrderType.Asks ? getAsks : getBids,
    shallowEqual
  );

  // 매도(asks) 내림차순, 매수(bids) 오름차순
  const ordersIds = useMemo(() => {
    // const prices = Object.keys(state); // for in 으로 교체

    const prices = [];
    for (const property in state) {
      // 수량이 0 인 객체 제외하여 id 배열 반환
      if (!Number(state[property])) {
        continue;
      }
      prices.push(property);
    }

    const sortedPrices = prices.sort(() => (type === OrderType.Asks ? -1 : 1));
    return sortedPrices;

    /* 
// 보여줄 최대 갯수의 설정이 필요할 때 사용
// lodash drop: https://lodash.com/docs/4.17.15#drop , dropRight: https://lodash.com/docs/4.17.15#dropRight
    const dropFunction = type === OrderType.Ask ? drop : dropRight;
    return dropFunction(
      sortedPrices,
      sortedPrices.length - ITEMS_TO_RENDER_PER_BOOK
    );
    */
  }, [state, type]);

  return (
    <div>
      {ordersIds.map((price) => {
        return <OrderItem key={price} price={price} type={type} />;
      })}
    </div>
  );
};
export default memo(OrderGrid);

// TODO: https://react-redux.js.org/api/hooks#useselector-examples useDispatch 시작전에 가장 마지막에 useMemo 관련된 최적화 코드도 해봐야할듯
// TODO: ids가 제대로 정렬되는지 검증필요(의심)
