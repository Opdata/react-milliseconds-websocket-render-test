// 전체 orderbook
const orderBookSocket = new WebSocket('wss://wbs.mexc.com/ws');
const connect = () => {
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
    console.log('orderbook onclose : ', e);
  };

  orderBookSocket.onerror = (e) => {
    console.log('onerror : ', e);
  };
};

connect();
