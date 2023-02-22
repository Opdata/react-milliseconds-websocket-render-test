import { useState, useMemo } from 'react';
import Row from './orderItem';

const TotalOrderBook = () => {
  const [symbol, setSymbol] = useState('');
  const [total, setTotal] = useState({ asks: [], bids: [] });
  const orderBook = useMemo(() => new Worker('/totalOrderBook.js'), []);
  orderBook.addEventListener('message', messageRender);

  function messageRender({ data }: any) {
    setSymbol(data.s);
    setTotal({
      asks: data.d.asks,
      bids: data.d.bids,
    });
    console.log('asks : ', data.d.asks);
    console.log('bids : ', data.d.bids);
  }
  return (
    <div className="App">
      <div style={{ marginBottom: '20px' }}>{symbol}</div>
      <div>asks</div>
      {total.asks.map(({ p, v }: { p: string; v: string }) => {
        return <Row key={Number(p)} p={p} v={v} />;
      })}
      <div>bids</div>
      {total.bids.map(({ p, v }: { p: string; v: string }) => {
        return <Row key={Number(p)} p={p} v={v} />;
      })}
    </div>
  );
};
export default TotalOrderBook;
