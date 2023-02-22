import { useMemo, useCallback } from 'react';
import { useRecoilState } from 'recoil';
import { symbolState, bidsState, asksState } from './store/atoms/orderAtoms';
import ItemsGrid from './components/orderGrid';
import { OrderType, OrderMaps } from './types/orderTypes';

function App() {
  const orderBook = useMemo(() => new Worker('./orderbook.js'), []);
  //   const [myModal, setMyModal] = useRecoilState(orderAtomFamily(''));
  const [symbol, setSymbol] = useRecoilState(symbolState);
  const [bids, setBids] = useRecoilState(bidsState);
  const [asks, setAsks] = useRecoilState(asksState);

  //   const addNewOrder = useCallback((newOrderbook: any) => {
  //     const convertedObject =
  //     const convertedOrderBook = newOrderbook.map(
  //       ({ p: price, v: value }: any) => ({ [price]: value })
  //     );
  //     console.log('convertedOrderBook : ', convertedOrderBook);
  //     return convertedOrderBook;
  //   }, []);

  const addNewOrder = useCallback(
    (newOrders: { p: string; v: string }[], initialOrders: OrderMaps) => {
      return newOrders.reduce((acc, current) => {
        const { p: price, v: value } = current;

        acc[price] = value;

        return acc;
      }, initialOrders);
    },
    []
  );

  const initialOrderBook = ({ data }: any) => {
    // console.log('message :', data);
    // console.log('bids : ', bids);
    // console.log('asks : ', asks);
    if (Object.entries(asks).length || Object.entries(bids).length) {
      orderBook.removeEventListener('message', initialOrderBook);

      return;
    }

    setSymbol(data.s);

    const bidsOrderBook = addNewOrder(data.d.bids, {});
    const asksOrderBook = addNewOrder(data.d.asks, {});

    setBids(bidsOrderBook as any);
    setAsks(asksOrderBook as any);
  };

  orderBook.addEventListener('message', initialOrderBook);
  // TODO:  close시 재핑
  orderBook.addEventListener('error', () => {
    orderBook.terminate();
  });

  if (!Object.entries(asks).length || !Object.entries(bids).length) {
    return <></>;
  }

  return (
    <div>
      <div>Symbol : {symbol}</div>
      <div>bids</div>
      <ItemsGrid type={OrderType.Bid} orders={bids} />
      <div>asks</div>
      <ItemsGrid type={OrderType.Ask} orders={asks} />
    </div>
  );
}

export default App;

/* 
v값이 0이면 로우에서 없애면됨
행은 20개 정도로 잡고(10개 보다 부족함 방지)

여기서 궁금한건 로우에서 없는 가격으로 매수나 매도를 걸면 호가가 변경될테고 이게 소켓으로 오는 => 옴

*/
