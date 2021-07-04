const Peer = window.Peer;

window.__SKYWAY_KEY__ = '7f6811d4-2b08-4bd7-8be8-cd036923e473';

(async function main() {
  const joinTrigger = document.getElementById('js-join-trigger');
  const leaveTrigger = document.getElementById('js-leave-trigger');
  const roomId = document.getElementById('js-room-id');
  const localText = document.getElementById('js-local-text');
  const sendTrigger = document.getElementById('js-send-trigger');
  const messages = document.getElementById('js-messages');
  // document.getElementById('js-user-id').value = '名無し';
  // let userId = '名無し';
  const userId = document.getElementById('js-user-id');

  const peer = (window.peer = new Peer({ key: '7f6811d4-2b08-4bd7-8be8-cd036923e473', }));

  // let user_id = '名無し';

  // Register join handler
  joinTrigger.addEventListener('click', () => {
    // Note that you need to ensure the peer has connected to signaling server
    // before using methods of peer instance.
    if (!peer.open) {
      return;
    }

    userId.disabled = true;
    let user_name = userId.value;

    if (user_name == '') {
      user_name = '名無し';
    }

    // let userId = '名無し';
    // userId = document.getElementById('js-user-id');

    const room = peer.joinRoom(roomId.value, { mode: 'mesh', });

    room.once('open', () => { messages.textContent += '=== You joined ===\n'; });
    // room.on('peerJoin', peerId => { messages.textContent += `=== ${peerId} joined ===\n`; });
    room.on('peerJoin', () => { messages.textContent += `=== ${user_name} joined ===\n`; });

    // room.on('data', ({ data, src }) => { messages.textContent += `${src}: ${data}\n`; });// Show a message sent to the room and who sent

    // for closing room members
    // room.on('peerLeave', peerId => { messages.textContent += `=== ${peerId} left ===\n`; });
    room.on('peerLeave', () => { messages.textContent += `=== ${user_name} left ===\n`; });

    // for closing myself
    room.once('close', () => {
      sendTrigger.removeEventListener('click', onClickSend);
      messages.textContent += '=== You left ===\n';
    });

    sendTrigger.addEventListener('click', onClickSend);
    leaveTrigger.addEventListener('click', () => { userId.disabled = false; room.close(), { once: true } });

    function onClickSend() {
      // Send message to all of the peers in the room via websocket
      room.send(localText.value);

      messages.textContent += `${user_name}: ${localText.value}\n`;
      // messages.textContent += `${peer.id}: ${localText.value}\n`;
      localText.value = '';
    }
  });

  peer.on('error', console.error);
})();