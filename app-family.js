// 가족 채팅 앱
function renderFamilyApp() {
    const screen = document.getElementById('familyScreen');

    const messagesHtml = appData.messages.map(msg => `
        <div class="msg ${!msg.isGuardian ? 'me' : ''}">
            <div class="msg-header">${msg.sender} · ${msg.time}</div>
            <div class="msg-bubble">${msg.content}</div>
        </div>
    `).join('');

    screen.innerHTML = `
        <div class="header row">
            <div class="header-title">가족 채팅</div>
            <div class="header-sub">구성원 3명</div>
        </div>
        <div class="alert-context">⚠️ 오후 2:00 – 움직임 없음 감지됨</div>
        <div class="chat-list" id="familyChatList">${messagesHtml}</div>
        <div class="quick-reply">
            <button class="quick-btn" onclick="sendFamilyQuick('내가 전화할게')">📞 내가 전화할게</button>
            <button class="quick-btn" onclick="sendFamilyQuick('확인했어')">✓ 확인했어</button>
            <button class="quick-btn" onclick="sendFamilyQuick('괜찮으신 것 같아')">😌 괜찮으신 것 같아</button>
        </div>
        <div class="input-area">
            <input type="text" class="msg-input" id="familyMsgInput" placeholder="메시지 입력..."
                   onkeydown="if(event.key==='Enter') sendFamilyMsg()">
            <button class="send-btn" onclick="sendFamilyMsg()">↑</button>
        </div>
    `;

    setTimeout(() => {
        const el = document.getElementById('familyChatList');
        if (el) el.scrollTop = el.scrollHeight;
    }, 100);
}

function sendFamilyMsg() {
    const input = document.getElementById('familyMsgInput');
    const content = input.value.trim();
    if (!content) { showToast('메시지를 입력해주세요'); return; }
    addMessage('딸 (김민지)', content, false);
    input.value = '';
    renderGuardianApp();
    renderFamilyApp();
    renderElderApp();
}

function sendFamilyQuick(text) {
    addMessage('딸 (김민지)', text, false);
    renderGuardianApp();
    renderFamilyApp();
    renderElderApp();
}
