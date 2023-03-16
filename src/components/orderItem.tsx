// @ts-nocheck
import { memo, useMemo, useCallback } from 'react';
import { OrderType } from '../types/orderTypes';
import { shallowEqual, useSelector } from 'react-redux';
import { getBids, getAsks } from '../store/selectors/orderSelectors';

interface OrderItemProps {
  type: OrderType;
}

const Price = ({ price }: string) => {
  return <div>{price}</div>;
};

export const MemoizedPrice = memo(Price);

const Value = ({ value }: string) => {
  return <div>{value}</div>;
};

export const MemoizedValue = memo(Value);

// const OrderItem = ({ price, type }: any) => {
const OrderItem = ({ type }: OrderItemProps) => {
  const state = useSelector(
    type === OrderType.Asks ? getAsks : getBids,
    shallowEqual
  );

  const dc = useCallback((left, right, order) => {
    const result = [];

    let leftIdx = 0;
    let rightIdx = 0;

    while (leftIdx < left.length && rightIdx < right.length) {
      let leftVal = parseFloat(left[leftIdx]);
      let rightVal = parseFloat(right[rightIdx]);

      if ((order && leftVal <= rightVal) || (!order && leftVal >= rightVal)) {
        result.push(left[leftIdx]);
        leftIdx++;
      } else {
        result.push(right[rightIdx]);
        rightIdx++;
      }
    }
    return result.concat(left.slice(leftIdx), right.slice(rightIdx));
  }, []);

  const mergeSort = useCallback(
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
  const ids = useMemo(() => Object.keys(state), [state]);

  const ordersIdsFunction = useMemo(
    () => mergeSort(ids, type === OrderType.Bids),
    [mergeSort, type, ids]
  );

  return ordersIdsFunction.map((price) => {
    const value = state[price];
    return (
      <div key={price} style={{ display: 'flex', gap: '50px' }}>
        <MemoizedPrice price={price} />
        <MemoizedValue value={value} />
      </div>
    );
  });
};

export default memo(OrderItem);
