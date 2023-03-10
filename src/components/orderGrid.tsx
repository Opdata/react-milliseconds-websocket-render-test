// @ts-nocheck
import { useCallback, memo } from 'react';
import { OrderType } from '../types/orderTypes';
import OrderItem from './orderItem';
import { useSelector } from 'react-redux';
import { getBids, getAsks } from '../store/selectors/orderSelectors';

interface OrderGridProps {
  type: OrderType;
}

const OrderGrid = ({ type }: OrderGridProps) => {
  const state = useSelector(type === OrderType.Asks ? getAsks : getBids);
  // 매도(asks) 내림차순, 매수(bids) 오름차순
  const ordersIdsFunction = useCallback(
    (newState) => {
      // const prices = Object.keys(state); // for in 으로 교체

      const prices = [];
      for (const property in newState) {
        // 수량이 0 인 객체 제외하여 id 배열 반환

        if (!Number(newState[property])) {
          // console.log('newState[property] : ', newState[property]);
          // console.log(
          //   '!Number(newState[property] : ',
          //   !Number(newState[property])
          // );
          // console.log(
          //   'Number(newState[property] : ',
          //   Number(newState[property])
          // );
          // console.log(
          //   'typeof Number(newState[property] : ',
          //   typeof Number(newState[property])
          // );
          continue;
        }
        prices.push(property);
      }

      const sortedPrices = prices.sort(() =>
        type === OrderType.Asks ? -1 : 1
      );
      // console.log('sortedPrices : ', sortedPrices);
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
    },
    [type]
  );

  return (
    <div>
      {ordersIdsFunction(state).map((price) => {
        return <OrderItem key={price} price={price} type={type} />;
      })}
    </div>
  );
};
export default memo(OrderGrid);

// TODO: https://react-redux.js.org/api/hooks#useselector-examples useDispatch 시작전에 가장 마지막에 useMemo 관련된 최적화 코드도 해봐야할듯
// TODO: ids가 제대로 정렬되는지 검증필요(의심)

// 15:01 시작 - 15:22분 확인터짐(100)
// 15:23 시작 - 15:29분 확인터짐(200)
// 15:53 시작 - 16:26분 정상 , 새로고침도 정상(300)
// 16:26 시작 - 17:04분 확인터짐(300)
// - 500터짐
// - 700터짐
// 100의 딜레이일때 40분 넘으니까 터짐

/* 
utils.ts:18 SerializableStateInvariantMiddleware took 46ms, which is more than the warning threshold of 32ms. 
If your state or actions are very large, you may want to disable the middleware as it might cause too much of a slowdown in development mode. See https://redux-toolkit.js.org/api/getDefaultMiddleware for instructions.
It is disabled in production builds, so you don't need to worry about that.

*/

/*
백그라운드로 돌려서 멈춘 후 다시 띄웠을때 렌더링이 다시 돌아갈시간 5분
*/

/* 
TODO: 시행착오 정리
0. 처음 useState, useEffect로 작업해봄 => 터짐(브라우저가 멈춰버림)
0. 괜찮은 샘플 코드 찾음 => 샘플 코드는 거래량이 비교가 될정도로 적음
0. 기존 코드를 recoil로 적용 => 브라우저 터짐
0. redux로 교체 => 많이 개선됨
0. 불필요 코드 제거 및 메모지에이션 개선
0. 장시간 뒤에 렌더링을 못 버티는지 새로고침이나 창 닫기가 바로 안됨
1. 기존 웹워커랑 이벤트리스너를 callback, memo로 메모지에이션 => 많이 개선됨
=> 오래 좀 쌓이면 새로고침시 딜레이 있음
2. 리듀스를 웹워커로 분리하고 그 메시지가 오면 상태업데이트 => 너무 느려서 사용불가
3. 예정 - 웹창이 최소화 상태일때는 렌더링 => 확인이 필요함 꼭 최소화 상태인 상황이 일어나지 않는지에 대한 확정적인 상황인지
*/
