// 현재호가 개별 order
const tradeSocket = new WebSocket('wss://wbs.mexc.com/ws');

tradeSocket.onopen = () => {
  const subscribe = {
    method: 'SUBSCRIPTION',
    params: ['spot@public.deals.v3.api@BTCUSDT'],
  };

  tradeSocket.send(JSON.stringify(subscribe));
};

tradeSocket.onmessage = (e) => {
  const message = JSON.parse(e.data);

  if (!message.d) {
    return;
  }

  postMessage(message);
};

tradeSocket.onclose = (e) => {
  console.log('onclose : ', e);
};

tradeSocket.onerror = (e) => {
  console.log('onerror : ', e);
};
