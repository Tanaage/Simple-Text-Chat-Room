const Peer = window.Peer;

function massageData(user, text) {
  this.user = '';
  this.text = '';
}

(async function main() {
  const joinTrigger = document.getElementById('js-join-trigger');
  const leaveTrigger = document.getElementById('js-leave-trigger');
  const roomId = document.getElementById('js-room-id');
  const localText = document.getElementById('js-local-text');
  const sendTrigger = document.getElementById('js-send-trigger');
  const messages = document.getElementById('js-messages');
  const userId = document.getElementById('js-user-id');

  const peer = (window.peer = new Peer({ key: '7f6811d4-2b08-4bd7-8be8-cd036923e473', }));

  let msg = new massageData('名無し', '');

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

    const room = peer.joinRoom(roomId.value, { mode: 'mesh', });
    msg.user = user_name;


    room.once('open', () => {
      messages.textContent += '=== You joined ===\n';
    });

    room.on('peerJoin', peerId => { messages.textContent += `=== ${peerId} joined ===\n`; });

    room.on('data', ({ data, src }) => { messages.textContent += `@${data.user}(${src}): ${data.text}\n`; });// Show a message sent to the room and who sent

    // for closing room members
    room.on('peerLeave', peerId => { messages.textContent += `=== ${peerId} left ===\n`; });

    // for closing myself
    room.once('close', () => {
      sendTrigger.removeEventListener('click', onClickSend);
      messages.textContent += '=== You left ===\n';
    });

    // send by enter-key
    localText.addEventListener('keypress', e => {
      if (e.key === 'Enter') {
        onClickSend();
      }
      return false;
    });

    sendTrigger.addEventListener('click', onClickSend);
    leaveTrigger.addEventListener('click', () => { userId.disabled = false; room.close(), { once: true } });

    function onClickSend() {
      msg.text = localText.value;
      msg.user = user_name;
      // Send message to all of the peers in the room via websocket
      room.send(msg);

      messages.textContent += `@${user_name}(You): ${localText.value}\n`;
      localText.value = '';
    }
  });

  peer.on('error', console.error);
})();