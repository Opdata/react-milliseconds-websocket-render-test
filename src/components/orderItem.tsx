// @ts-nocheck
import { memo } from 'react';
import { OrderType } from '../types/orderTypes';
import { useSelector } from 'react-redux';
import { selectAsk, selectBid } from '../store/selectors/orderSelectors';

const OrderItem = ({ price, type }: any) => {
  const order =
    type === OrderType.Asks
      ? (state) => selectAsk(price, state)
      : (state) => selectBid(price, state);

  const value = useSelector(order);
  
  return (
    <div style={{ display: 'flex', gap: '50px' }}>
      <div>{price}</div>
      <div>{value}</div>
    </div>
  );
};

export default memo(OrderItem);
