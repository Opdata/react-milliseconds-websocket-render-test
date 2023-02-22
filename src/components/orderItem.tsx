import { memo } from 'react';
import { useRecoilValue } from 'recoil';
import { orderAtomFamily } from '../store/atoms/orderAtoms';

/* TODO: 바인딩 형태로 사용한 컴포넌트 => atomfamily 에서 name 및 id 를 통해서 해당 atom만 구독하게 */
// const OrderItem = ({ name, id }: any) => {
//   //   console.log(props);
//   const [order] = useRecoilValue(orderAtomFamily(`${name}-${id}`));
//   return (
//     <div style={{ display: 'flex', gap: '50px' }}>
//       <div>{order.p}</div>
//       <div>{order.v}</div>
//     </div>
//   );
// };

const OrderItem = ({ price, value }: any) => {
  //   console.log(props);
  // const [order] = useRecoilValue(orderAtomFamily(`${name}-${id}`));
  return (
    <div style={{ display: 'flex', gap: '50px' }}>
      <div>{price}</div>
      <div>{value}</div>
    </div>
  );
};

export default memo(OrderItem);
