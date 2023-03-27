// @ts-nocheck
import { memo, useMemo, useCallback } from 'react';
import { OrderType } from '../types/orderTypes';
import { shallowEqual, useSelector } from 'react-redux';
import { getBids, getAsks } from '../store/selectors/orderSelectors';
import { drop, dropRight } from 'lodash';

interface OrderItemProps {
  type: OrderType;
}

const ITEMS_TO_RENDER_PER_BOOK = 100;

const Price = ({ price }: string) => {
  return <div>{price}</div>;
};

export const MemoizedPrice = memo(Price);

const Value = ({ value }: string) => {
  return <div>{value}</div>;
};

export const MemoizedValue = memo(Value);

const OrderItem = ({ type }: OrderItemProps) => {
  const state = useSelector(
    type === OrderType.Asks ? getAsks : getBids,
    shallowEqual
  );

  const orderDirection = type === OrderType.Asks;
  const setLimitFunction = useCallback(
    (array, length) =>
      orderDirection ? drop(array, length) : dropRight(array, length),
    [orderDirection]
  );

  const dc = useMemo(
    (left, right, order) => {
      const array = [];

      let leftIdx = 0;
      let rightIdx = 0;

      while (leftIdx < left.length && rightIdx < right.length) {
        let leftVal = parseFloat(left[leftIdx]);
        let rightVal = parseFloat(right[rightIdx]);

        if ((order && leftVal <= rightVal) || (!order && leftVal >= rightVal)) {
          array.push(left[leftIdx]);
          leftIdx++;
        } else {
          array.push(right[rightIdx]);
          rightIdx++;
        }
      }
      const result = array.concat(left.slice(leftIdx), right.slice(rightIdx));
      return setLimitFunction(result, result.length - ITEMS_TO_RENDER_PER_BOOK);

      // return array.concat(left.slice(leftIdx), right.slice(rightIdx));
    },
    [setLimitFunction]
    // []
  );

  const mergeSort = useMemo(
    (arr, order) => {
      if (arr.length <= 1) {
        return arr;
      }

      const mid = Math.floor(arr.length / 2);
      const left = arr.slice(0, mid);
      const right = arr.slice(mid);

      return dc(mergeSort(left, order), mergeSort(right, order), order);
    },
    [dc]
  );
  // const ids = useMemo(() => Object.keys(state), [state]);
  const ids = Object.keys(state);

  const orderIdsList = useMemo(
    () => mergeSort(ids, orderDirection),
    [mergeSort, ids, orderDirection]
  );

  if (!orderIdsList.length) {
    return <></>;
  }

  // console.log('orderIdsList : ', orderIdsList.length);
  // console.log('type : ', type);
  // console.log('state : ', state);
  // console.log('state.length : ', Object.keys(state).length);

  // return orderIdsList.map((price) => {
  //   const value = state[price];
  //   return (
  //     <div key={price} style={{ display: 'flex', gap: '50px' }}>
  //       <MemoizedPrice price={price} />
  //       <MemoizedValue value={value} />
  //     </div>
  //   );
  // });
  return <></>;
};

export default memo(OrderItem);
