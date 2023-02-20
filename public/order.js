const socket = new WebSocket('wss://wbs.mexc.com/ws');

socket.onopen = () => {
  const subscribe = {
    method: 'SUBSCRIPTION', // Diff.Depth Stream
    params: ['spot@public.increase.depth.v3.api@BTCUSDT'], // 현재호가, v가 0이면 로우 제거해야함
  };

  socket.send(JSON.stringify(subscribe));
};

socket.onmessage = (e) => {
  const message = JSON.parse(e.data);

  if (!message.d) {
    return;
  }

  postMessage(message);
};

socket.onclose = (e) => {
  console.log('onclose : ', e);
};
socket.onerror = (e) => {
  console.log('onerror : ', e);
};
