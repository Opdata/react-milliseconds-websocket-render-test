import { atom, atomFamily, selectorFamily } from 'recoil';
import { OrderMaps } from '../../types/orderTypes';

export const symbolState = atom<string>({
  key: 'symbol',
  default: '',
});

export const bidsState = atom<OrderMaps>({
  key: 'bidIdsState',
  default: {},
});

export const asksState = atom<OrderMaps>({
  key: 'asksIdsState',
  default: {},
});

/* TODO: 1차로 구현 후 상세하게 분리하기 위한 아래 예상 코드

bidsIdsState: [] = ids 배열
asksIdsState: [] = ids 배열
이후 수량은 다른 방식 고려

*/

// export const orderAtomFamily = atomFamily<any, any>({
//   key: 'orderAtomFamily',
//   default: (name: 'bids' | 'asks', id: number) => ({
//     id: name + `-${id}`,
//     value: 0,
//   }),
// });

export const orderAtomFamily = atomFamily<any, any>({
  key: 'orderAtomFamily',
  default: selectorFamily({
    key: 'orderAtomFamily/default',
    // @ts-ignore
    get:
      (name: 'bids' | 'asks', id: string) =>
      ({ get }: any) => {
        const orderIds = get(name === 'bids' ? bidsState : asksState);
        const { p, v }: { p: string; v: string } = orderIds.find(
          ({ p }: { p: string }) => p === id
        );
        return {
          p,
          v,
        };
      },
  }),
});
