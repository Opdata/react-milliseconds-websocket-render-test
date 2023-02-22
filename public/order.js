// 현재호가 개별 order
const orderSocket = new WebSocket('wss://wbs.mexc.com/ws');

orderSocket.onopen = () => {
  const subscribe = {
    method: 'SUBSCRIPTION', // Diff.Depth Stream
    params: ['spot@public.increase.depth.v3.api@BTCUSDT'], // 현재호가, v가 0이면 로우 제거해야함
  };

  orderSocket.send(JSON.stringify(subscribe));
};

orderSocket.onmessage = (e) => {
  const message = JSON.parse(e.data);

  if (!message.d) {
    return;
  }

  postMessage(message);
};

orderSocket.onclose = (e) => {
  console.log('onclose : ', e);
};

orderSocket.onerror = (e) => {
  console.log('onerror : ', e);
};
