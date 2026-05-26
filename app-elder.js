// 어르신 앱
let elderCurrentScreen = 'home';

function renderElderApp() {
    const screen = document.getElementById('elderScreen');
    screen.innerHTML = elderCurrentScreen === 'home'
        ? renderElderHome()
        : renderElderMessages();
}

function renderElderHome() {
    const latestMsg = appData.messages[appData.messages.length - 1];
    const shortNames = appData.checkedMembers.map(name => {
        if (name.includes('철수')) return '아들';
        if (name.includes('민지')) return '딸';
        if (name.includes('보호자')) return '보호자';
        return name;
    }).join('·');

    return `
        <div class="elder-screen">
            <div class="main-msg">
                <div class="main-text">
                    오늘 ${shortNames}<br>
                    ${appData.checkCount}명이<br>확인했어요
                </div>
                <div class="emoji">💙</div>
                <div class="member-list">${appData.checkedMembers.join(', ')}</div>
            </div>
            <div class="msg-preview">
                <div class="msg-sender">${latestMsg.sender}</div>
                <div class="msg-content">${latestMsg.content}</div>
            </div>
            <button class="btn-view-msg" onclick="showElderMessages()">
                가족 메시지 전체 보기
            </button>
        </div>
    `;
}

function renderElderMessages() {
    const messagesHtml = [...appData.messages].reverse().map(msg => `
        <div class="elder-msg-item ${msg.sender.includes('김순자') ? 'elder-msg-mine' : ''}">
            <div class="elder-msg-sender">${msg.sender}</div>
            <div class="elder-msg-content">${msg.content}</div>
            <div class="elder-msg-time">${msg.time}</div>
        </div>
    `).join('');

    return `
        <div class="header row">
            <button class="back-btn" onclick="showElderHome()">‹</button>
            <div class="header-title">가족 메시지</div>
        </div>
        <div class="elder-msg-list" id="elderMsgList" style="overflow-y:auto;flex:1;min-height:0">
            ${messagesHtml}
        </div>
        <div class="elder-quick-reply">
            <button class="elder-quick-btn" onclick="sendElderReply('알겠어요')">알겠어요</button>
            <button class="elder-quick-btn" onclick="sendElderReply('고마워요')">고마워요</button>
            <button class="elder-quick-btn" onclick="sendElderReply('👍')">👍</button>
        </div>
        <div class="elder-input-area">
            <button class="elder-voice-btn ${elderRecording ? 'recording' : ''}" onclick="toggleElderVoice()" id="elderVoiceBtn">
                ${elderRecording ? '⏹' : '🎤'}
            </button>
            <input type="text" class="elder-msg-input" id="elderMsgInput" placeholder="메시지 입력..."
                   onkeydown="if(event.key==='Enter') sendElderMsg()">
            <button class="elder-send-btn" onclick="sendElderMsg()">↑</button>
        </div>
    `;
}

let elderRecording = false;
let elderRecordTimer = null;

function sendElderMsg() {
    const input = document.getElementById('elderMsgInput');
    if (!input) return;
    const content = input.value.trim();
    if (!content) return;
    addMessage('어머니 (김순자)', content, false);
    input.value = '';
    renderCareApp();
    renderElderApp();
    setTimeout(() => {
        const list = document.getElementById('elderMsgList');
        if (list) list.scrollTop = 0;
    }, 100);
}

function toggleElderVoice() {
    if (elderRecording) {
        // 녹음 중단 → 전송
        elderRecording = false;
        clearTimeout(elderRecordTimer);
        const secs = Math.floor(Math.random() * 4) + 2;
        addMessage('어머니 (김순자)', `🎤 음성 메시지 (${secs}초)`, false);
        renderCareApp();
        renderElderApp();
        showToast('음성 메시지를 보냈어요');
    } else {
        // 녹음 시작
        elderRecording = true;
        renderElderApp();
        showToast('🎤 녹음 중... 다시 누르면 전송');
        // 8초 후 자동 종료
        elderRecordTimer = setTimeout(() => {
            if (elderRecording) toggleElderVoice();
        }, 8000);
    }
}

function sendElderReply(text) {
    addMessage('어머니 (김순자)', text, false);
    renderCareApp();
    renderElderApp();
}

function showElderMessages() {
    elderCurrentScreen = 'messages';
    renderElderApp();
}

function showElderHome() {
    elderCurrentScreen = 'home';
    renderElderApp();
}
