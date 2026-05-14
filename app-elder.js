// 어르신 앱 렌더링
let elderCurrentScreen = 'home'; // home, messages

function renderElderApp() {
    const screen = document.getElementById('elderScreen');
    
    if (elderCurrentScreen === 'home') {
        screen.innerHTML = renderElderHome();
    } else {
        screen.innerHTML = renderElderMessages();
    }
}

function renderElderHome() {
    const latestMsg = appData.messages[appData.messages.length - 1];
    
    const shortNames = appData.checkedMembers.map(name => {
        if (name.includes('아들')) return '아들';
        if (name.includes('딸')) return '딸';
        if (name.includes('보호자')) return '보호자';
        return name;
    }).join('·');

    return `
        <div class="elder-screen">
            <div class="main-msg">
                <div class="main-text">
                    오늘 ${shortNames}<br>
                    ${appData.checkCount} 명이<br>
                    확인했어요
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
    const messagesHtml = appData.messages.map(msg => `
        <div class="elder-msg-item">
            <div class="elder-msg-sender">${msg.sender}</div>
            <div class="elder-msg-content">${msg.content}</div>
            <div class="elder-msg-time">${msg.time}</div>
        </div>
    `).join('');

    return `
        <div class="header" style="display: flex; align-items: center;">
            <button class="back-btn" onclick="showElderHome()">←</button>
            <div class="header-title">가족 메시지</div>
        </div>

        <div class="elder-msg-list">
            ${messagesHtml}
        </div>

        <div class="quick-reply" style="padding: 12px;">
            <button class="quick-btn" onclick="sendElderReply('알겠어요')">알겠어요</button>
            <button class="quick-btn" onclick="sendElderReply('고마워요')">고마워요</button>
            <button class="quick-btn" onclick="sendElderReply('👍')">👍</button>
        </div>
    `;
}

function sendElderReply(text) {
    addMessage('어머니 (김순자)', text, false);
    renderGuardianApp();
    renderFamilyApp();
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
