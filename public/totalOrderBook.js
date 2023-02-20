// 전체 orderbook

const socket = new WebSocket('wss://wbs.mexc.com/ws');

socket.onopen = () => {
  const subscribe = {
    method: 'SUBSCRIPTION',
    params: ['spot@public.limit.depth.v3.api@BTCUSDT@20'],
  };

  socket.send(JSON.stringify(subscribe));
};

socket.onmessage = (e) => {
  const message = JSON.parse(e.data);
  if (!message.d) {
    return;
  }

  postMessage(message);
  // socket.close();
};
