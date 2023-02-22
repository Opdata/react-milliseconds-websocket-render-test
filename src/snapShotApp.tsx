import { useState, useMemo } from 'react';
// import Table from './components/table';
import Row from './components/orderItem';
import TotalOrderBook from './components/totalOrderBook';
// import TotalOrderBook from './components/totalOrderBook';

function App() {
  const [symbol, setSymbol] = useState('');
  const [asks, setAsks] = useState<any>([]);
  const [bids, setBids] = useState<any>([]);
  const orderBook = useMemo(() => new Worker('/totalOrderBook.js'), []);
  const partialOrder = useMemo(() => new Worker('/order.js'), []);

  const initialOrderBook = ({ data }: any) => {
    if (asks.length || bids.length) {
      orderBook.terminate();
      return;
    }

    setSymbol(data.s);
    setAsks(data.d.asks);
    setBids(data.d.bids);
  };

  orderBook.addEventListener('message', initialOrderBook);

  let invokeId = 1;
  function invoke() {
    return invokeId++;
  }

  const id = invoke();
  const pushNewsOrder = ({ data }: any) => {
    if (!asks.length && !bids.length) {
      return;
    }
    // console.log(data);

    if (!data.d.bids) {
      console.log('id : ', id, '\t2');
      // data.d 안에 bids가 없으면 asks 데이터
      // console.log('data.d : ', data.d.asks[0].p);
      // console.log('asks.p : ', data.d.asks[0].p);
      // console.log('asks : ', asks);
      // let orgAsks = asks;
      const isExistIndex = asks.findIndex(
        ({ p }: any) => p === data.d.asks[0].p
      );
      console.log('id : ', id, '\t3');
      let newAsks = [];

      if (isExistIndex !== -1) {
        // -1이 아닐때(존재할시)
        const previousOrder = asks[isExistIndex];
        // console.log('previousOrder : ', previousOrder);
        const leftArray = asks.slice(0, isExistIndex);
        const rightArray = asks.slice(isExistIndex + 1);
        newAsks = [...leftArray, previousOrder, ...rightArray];
        // setAsks(newAsks);
        return;
      }
      console.log('id : ', id, '\t4');
      // TODO: 존재하지만 v가 0 이여서 로우에서 삭제해야할 때

      if (isExistIndex === -1) {
        // -1일때 (존재하지 않을때)
        const insertOrder = data.d.asks[0];
        const insertOrderValue = data.d.asks[0].p;
        // console.log('insertOrder : ', insertOrderValue);

        let leftPointer = 0;
        let rightPointer = asks.length - 1;

        while (true) {
          // 매도에서는 비교하는 값보다 크면 그 해당 값을 가져온 인덱스보다 앞에 위치시킨다.

          if (leftPointer === rightPointer) {
            break;
          }

          if (Number(asks[leftPointer].p) < Number(insertOrderValue)) {
            // 넣어야하는 값이 기존 leftIndex의 값 보다 크다면 다음 인덱스로
            leftPointer++;
          }
          if (Number(asks[rightPointer].p) > Number(insertOrderValue)) {
            // 넣어야하는 값이 기존 rightIndex의 값 보다 작다면 이전 인덱스로
            rightPointer--;
          }
        }

        console.log('id : ', id, '\t5');

        const leftArray = asks.slice(0, asks[leftPointer]);
        const rightArray = asks.slice(asks[rightPointer]);
        newAsks = [...leftArray, insertOrder, ...rightArray];
        console.log('id : ', id, '\t6');
        // console.log('로우 삽입');
        // setAsks(newAsks);
      }
    }
    console.log('message call back');
  };

  partialOrder.addEventListener('message', pushNewsOrder);

  if (!asks.length || !bids.length) {
    return <div>Loading</div>;
  }

  return (
    <div className="App">
      <div style={{ marginBottom: '20px' }}>{symbol}</div>
      <div>asks</div>
      {asks.map(({ p, v }: { p: string; v: string }) => {
        return <Row key={Number(p)} p={p} v={v} />;
      })}
      <div>bids</div>
      {bids.map(({ p, v }: { p: string; v: string }) => {
        return <Row key={Number(p)} p={p} v={v} />;
      })}
    </div>
    // <div className="App">
    //   <TotalOrderBook />
    // </div>
  );
}

export default App;

/* 
v값이 0이면 로우에서 없애면됨
행은 20개 정도로 잡고(10개 보다 부족함 방지)

여기서 궁금한건 로우에서 없는 가격으로 매수나 매도를 걸면 호가가 변경될테고 이게 소켓으로 오는 => 옴

*/
