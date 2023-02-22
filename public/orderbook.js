// 전체 orderbook
const orderBookSocket = new WebSocket('wss://wbs.mexc.com/ws');

orderBookSocket.onopen = () => {
  const subscribe = {
    method: 'SUBSCRIPTION',
    params: ['spot@public.limit.depth.v3.api@BTCUSDT@20'],
  };

  orderBookSocket.send(JSON.stringify(subscribe));
};

orderBookSocket.onmessage = (e) => {
  const message = JSON.parse(e.data);

  if (!message.d) {
    return;
  }

  postMessage(message);
  orderBookSocket.close();
};

orderBookSocket.onclose = (e) => {
  console.log('onclose : ', e);
};

orderBookSocket.onerror = (e) => {
  console.log('onerror : ', e);
};

/* 

connecting time :  Mon Feb 20 2023 16:06:33 GMT+0900 (한국 표준시)
websocket disconnect time :  Mon Feb 20 2023 18:12:27 GMT+0900 (한국 표준시)

*/
