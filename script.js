const Peer = window.Peer;

(async function main() {
  const joinTrigger = document.getElementById('js-join-trigger');
  const leaveTrigger = document.getElementById('js-leave-trigger');
  const roomId = document.getElementById('js-room-id');
  const localText = document.getElementById('js-local-text');
  const sendTrigger = document.getElementById('js-send-trigger');
  const messages = document.getElementById('js-messages');
  const userId = document.getElementById('js-user-id');
  const errmsg = document.getElementById(`message-error-message`)

  const peer = (window.peer = new Peer({ key: '7f6811d4-2b08-4bd7-8be8-cd036923e473', }));

  const msg = {type:"chat",user: "名無し", text:""}
  const systemMsg = {type:"system",text:""}

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

    room.on('data', ({ data, src }) => { 
      console.log(data)
      if(data.type === `chat`){
      messages.textContent += `${currentDate()}:@${data.user}(${src}): ${data.text}\n`;
      const systemMsg = {type:"system",text:"既読"}
      room.send(systemMsg);
    
    }
     });// Show a message sent to the room and who sent


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

      messages.textContent += `${currentDate()}:@${user_name}(You): ${localText.value}\n`;
      localText.value = '';
    }
  });

  peer.on('error', console.error);

    localText.oninput = handleChange;

    function handleChange(e) {
      if(localText.value.length >= 10){
        errmsg.textContent = `入力可能文字数を超えています。`
        console.log(`入力可能文字数を超えています。`)
        sendTrigger.setAttribute("disabled", true);
      }else{
        sendTrigger.removeAttribute("disabled")
        errmsg.textContent = ``
      }

      console.log(localText.value.length);
    }


})();

const currentDate = () => {
  let current = new Date();
  current.setTime(current.getTime() + 60 * 60);

  const year_str = current.getFullYear();
  const month_str = 1 + current.getMonth();
  const day_str = current.getDate();
  const hour_str = current.getHours();
  const minute_str = current.getMinutes();
  const second_str = current.getSeconds();

  let format_str = 'YYYY年MM月DD日 hh:mm:ss';
  format_str = format_str.replace(/YYYY/g, String(year_str));
  format_str = format_str.replace(/MM/g, String(month_str));
  format_str = format_str.replace(/DD/g, String(day_str));
  format_str = format_str.replace(/hh/g, zeroPadding(hour_str, 2));
  format_str = format_str.replace(/mm/g, zeroPadding(minute_str, 2));
  format_str = format_str.replace(/ss/g, zeroPadding(second_str, 2));

  return format_str;
}


function zeroPadding(num, digits) {
  return ("0".repeat(digits) + num).slice(-digits);
}