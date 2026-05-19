// 보호자 앱
let guardianCurrentScreen = 'dashboard';

function renderGuardianApp() {
    const screen = document.getElementById('guardianScreen');
    switch (guardianCurrentScreen) {
        case 'dashboard': screen.innerHTML = renderGuardianDashboard(); break;
        case 'chat':
            screen.innerHTML = renderGuardianChat();
            setTimeout(scrollGuardianChatToBottom, 100);
            break;
        case 'alerts':   screen.innerHTML = renderGuardianAlerts();   break;
        case 'settings': screen.innerHTML = renderGuardianSettings(); break;
        case 'schedule': screen.innerHTML = renderGuardianSchedule(); break;
        case 'calendar': screen.innerHTML = renderGuardianCalendar(); break;
    }
}

// ── 네비 헬퍼 ──────────────────────────────────────────────
function guardianNav(active) {
    const unread = appData.alerts.filter(a => !a.read).length;
    const badge = unread > 0 ? `<span class="badge">${unread}</span>` : '';
    return `
        <div class="bottom-nav">
            <button class="nav-btn ${active === 'dashboard' ? 'active' : ''}" onclick="showGuardianScreen('dashboard')">
                <span class="nav-icon">🏠</span>홈
            </button>
            <button class="nav-btn ${active === 'chat' ? 'active' : ''}" onclick="showGuardianScreen('chat')">
                <span class="nav-icon">💬</span>채팅
            </button>
            <button class="nav-btn ${active === 'schedule' ? 'active' : ''}" onclick="showGuardianScreen('schedule')">
                <span class="nav-icon">📋</span>역할
            </button>
            <button class="nav-btn ${active === 'alerts' ? 'active' : ''}" onclick="showGuardianScreen('alerts')">
                <span class="nav-icon">🔔</span>알림${badge}
            </button>
        </div>
    `;
}

// ── 대시보드 ───────────────────────────────────────────────
function renderGuardianDashboard() {
    const unresolvedAlert = appData.alerts.find(a => !a.resolved);
    const alertBanner = unresolvedAlert ? `
        <div class="alert-banner">
            <div class="alert-dot"></div>
            2시간 이상 움직임이 감지되지 않았어요
        </div>` : '';

    return `
        <div class="screen-content">
            <div class="header">
                <div class="elder-name">김순자 어머니</div>
                <div class="last-update">
                    마지막 업데이트: ${getCurrentTime()}
                    <button class="refresh-btn" onclick="refreshHealthData()">🔄</button>
                </div>
            </div>
            ${alertBanner}
            <div class="cards">
                <div class="card ${unresolvedAlert ? 'danger' : ''}">
                    <div class="card-title">활동량</div>
                    <div class="card-value">${appData.healthData.steps.toLocaleString()} 걸음</div>
                    <div class="card-status ${unresolvedAlert ? 'status-danger' : 'status-normal'}">
                        마지막 움직임: ${appData.healthData.lastActive}
                    </div>
                </div>
                <div class="card">
                    <div class="card-title">심박수</div>
                    <div class="card-value">${appData.healthData.heartRate} bpm</div>
                    <div class="card-status status-normal">정상 범위</div>
                </div>
                <div class="card">
                    <div class="card-title">수면</div>
                    <div class="card-value">${appData.healthData.sleep}</div>
                    <div class="card-status status-normal">양호</div>
                </div>
                <div class="card">
                    <div class="card-title">복약</div>
                    <div class="card-value">오전 ✓</div>
                    <div class="card-status status-normal">복약 완료</div>
                </div>
            </div>
        </div>
        ${guardianNav('dashboard')}
    `;
}

function refreshHealthData() {
    simulateHealthData();
    renderGuardianApp();
}

// ── 채팅 ───────────────────────────────────────────────────
function renderGuardianChat() {
    const messagesHtml = appData.messages.map(msg => `
        <div class="msg ${msg.isGuardian ? 'me' : ''}">
            <div class="msg-header">${msg.sender} · ${msg.time}</div>
            <div class="msg-bubble">${msg.content}</div>
        </div>
    `).join('');

    const unresolvedAlert = appData.alerts.find(a => !a.resolved);
    const resolveBtn = unresolvedAlert
        ? `<button class="quick-btn" onclick="markAlertResolved()">✓ 해결 완료</button>`
        : '';

    return `
        <div class="header row">
            <button class="back-btn" onclick="showGuardianScreen('dashboard')">‹</button>
            <div class="header-title">가족 채팅</div>
            <div class="header-sub">구성원 3명</div>
        </div>
        <div class="alert-context">
            ⚠️ 오후 2:00 – 움직임 없음 감지됨
            ${resolveBtn}
        </div>
        <div class="chat-list" id="guardianChatList">${messagesHtml}</div>
        <div class="quick-reply">
            <button class="quick-btn" onclick="sendGuardianQuick('내가 전화할게')">📞 내가 전화할게</button>
            <button class="quick-btn" onclick="sendGuardianQuick('확인했어')">✓ 확인했어</button>
            <button class="quick-btn" onclick="sendGuardianQuick('괜찮으신 것 같아')">😌 괜찮으신 것 같아</button>
        </div>
        <div class="input-area">
            <input type="text" class="msg-input" id="guardianMsgInput" placeholder="메시지 입력..."
                   onkeydown="if(event.key==='Enter') sendGuardianMsg()">
            <button class="send-btn" onclick="sendGuardianMsg()">↑</button>
        </div>
    `;
}

function markAlertResolved() {
    const unresolved = appData.alerts.find(a => !a.resolved);
    if (unresolved) {
        resolveAlert(unresolved.id);
        showToast('알림이 해결됨으로 표시됐어요');
        renderGuardianApp();
    }
}

// ── 알림 ───────────────────────────────────────────────────
function renderGuardianAlerts() {
    const alertsHtml = appData.alerts.map(alert => {
        const cls = alert.resolved ? 'resolved' : '';
        const prefix = alert.resolved ? '✓ 해결됨 · ' : '⚠️ 미해결 · ';
        return `
            <div class="alert-item ${cls}" onclick="showAlertDetail(${alert.id})">
                <div class="alert-type">${prefix}${alert.type}</div>
                <div class="alert-desc">${alert.desc}</div>
                <div class="alert-time">${alert.time}</div>
            </div>
        `;
    }).join('');

    return `
        <div class="screen-content">
            <div class="header">
                <div class="elder-name">알림</div>
            </div>
            <div class="alert-list">${alertsHtml}</div>
        </div>
        ${guardianNav('alerts')}
    `;
}

function showAlertDetail(alertId) {
    const alert = appData.alerts.find(a => a.id === alertId);
    if (alert) alert.read = true;
    showGuardianScreen('chat');
}

// ── 설정 ───────────────────────────────────────────────────
function renderGuardianSettings() {
    const on = v => v ? 'ON' : 'OFF';
    return `
        <div class="screen-content">
            <div class="header">
                <div class="elder-name">설정</div>
            </div>
            <div class="settings-list">
                <div class="setting-item" onclick="toggleSetting('notifications')">
                    <div class="setting-label">알림 받기</div>
                    <div class="setting-value">${on(appData.settings.notifications)}</div>
                </div>
                <div class="setting-item" onclick="toggleSetting('sound')">
                    <div class="setting-label">알림 소리</div>
                    <div class="setting-value">${on(appData.settings.sound)}</div>
                </div>
                <div class="setting-item" onclick="toggleSetting('vibration')">
                    <div class="setting-label">진동</div>
                    <div class="setting-value">${on(appData.settings.vibration)}</div>
                </div>
                <div class="setting-item">
                    <div class="setting-label">앱 버전</div>
                    <div class="setting-value" style="color:#999;">1.0.0</div>
                </div>
            </div>
        </div>
        ${guardianNav('settings')}
    `;
}

function toggleSetting(key) {
    appData.settings[key] = !appData.settings[key];
    renderGuardianApp();
}

// ── 역할 스케줄 ────────────────────────────────────────────
function renderGuardianSchedule() {
    const scheduleHtml = appData.schedule.assignments.map((item, index) => {
        const statusClass = item.status === 'confirmed' ? 'status-normal' : 'status-warning';
        const statusText  = item.status === 'confirmed' ? '확정' : '대기';
        const confirmBtn  = item.status === 'pending' && item.member === '보호자 (나)'
            ? `<button class="quick-btn" style="margin-top:8px" onclick="confirmSchedule(${index})">수락</button>`
            : '';
        return `
            <div class="card">
                <div style="display:flex;justify-content:space-between;align-items:flex-start">
                    <div>
                        <div class="card-title">${item.day}</div>
                        <div style="font-size:16px;margin:6px 0;font-weight:600;color:#1a1a1a">${item.member}</div>
                        <div style="font-size:13px;color:#888">${item.task}</div>
                    </div>
                    <div style="text-align:right">
                        <div class="card-status ${statusClass}">${statusText}</div>
                        ${confirmBtn}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="screen-content">
            <div class="header">
                <div class="elder-name">이번 주 역할 분담</div>
                <div class="last-update">
                    ${appData.schedule.weekStart} ~
                    <button class="refresh-btn" onclick="showGuardianScreen('calendar')">📅</button>
                </div>
            </div>
            <div class="cards">${scheduleHtml}</div>
        </div>
        ${guardianNav('schedule')}
    `;
}

function confirmSchedule(index) {
    appData.schedule.assignments[index].status = 'confirmed';
    showToast('일정을 수락했어요');
    renderGuardianApp();
}

// ── 캘린더 ─────────────────────────────────────────────────
function renderGuardianCalendar() {
    const { currentMonth, currentYear, events } = appData.calendar;
    const selectedDate = appData.calendar.selectedDate || null;
    const monthNames = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    const lastDay  = new Date(currentYear, currentMonth, 0);
    const startDow = firstDay.getDay();

    let calHtml = '<div class="calendar-grid">';
    ['일','월','화','수','목','금','토'].forEach(d => {
        calHtml += `<div class="calendar-day-header">${d}</div>`;
    });
    for (let i = 0; i < startDow; i++) calHtml += '<div class="calendar-day empty"></div>';

    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dateStr = `${currentYear}-${String(currentMonth).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        const dayEvents = events.filter(e => e.date === dateStr);
        const isToday   = day === 16;
        const isSelected = selectedDate === dateStr;
        const dots = dayEvents.map(e => {
            const cls = e.type === 'visit' ? 'dot-visit' : e.type === 'call' ? 'dot-call' : 'dot-medical';
            return `<span class="event-dot ${cls}"></span>`;
        }).join('');
        calHtml += `
            <div class="calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}"
                 onclick="selectDate('${dateStr}')">
                <div class="day-number">${day}</div>
                ${dots ? `<div class="event-dots">${dots}</div>` : ''}
            </div>
        `;
    }
    calHtml += '</div>';

    const filteredEvents = selectedDate ? events.filter(e => e.date === selectedDate) : events;
    const sectionTitle   = selectedDate ? `${selectedDate} 일정` : '이번 달 일정';
    const clearBtn       = selectedDate ? `<button class="quick-btn" onclick="clearDateSelection()">전체 보기</button>` : '';
    const eventListHtml  = filteredEvents.length > 0
        ? filteredEvents.map(e => {
            const icon = e.type === 'visit' ? '🏠' : e.type === 'call' ? '📞' : '🏥';
            const type = e.type === 'visit' ? '방문' : e.type === 'call' ? '전화' : '병원';
            return `
                <div class="event-item">
                    <div class="event-icon">${icon}</div>
                    <div class="event-info">
                        <div class="event-title">${e.title}</div>
                        <div class="event-date">${e.date} · ${type}</div>
                    </div>
                </div>
            `;
        }).join('')
        : '<div style="text-align:center;padding:20px;color:#bbb;font-size:14px">일정이 없습니다</div>';

    return `
        <div class="screen-content">
            <div class="header row">
                <button class="back-btn" onclick="showGuardianScreen('schedule')">‹</button>
                <div class="header-title">${monthNames[currentMonth - 1]} ${currentYear}</div>
                <button class="refresh-btn" onclick="addCalendarEvent()">➕</button>
            </div>
            ${calHtml}
            <div class="event-list-section">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
                    <div class="section-title">${sectionTitle}</div>
                    ${clearBtn}
                </div>
                ${eventListHtml}
            </div>
        </div>
        ${guardianNav('schedule')}
    `;
}

function selectDate(dateStr) {
    appData.calendar.selectedDate = dateStr;
    renderGuardianApp();
}
function clearDateSelection() {
    appData.calendar.selectedDate = null;
    renderGuardianApp();
}

function addCalendarEvent() {
    showToast('일정 추가는 모바일 앱에서 이용 가능해요');
}

// ── 화면 전환 ──────────────────────────────────────────────
function showGuardianScreen(screen) {
    guardianCurrentScreen = screen;
    if (screen === 'dashboard') {
        incrementCheckCount('보호자 (나)');
        renderElderApp();
    }
    renderGuardianApp();
}

// ── 메시지 전송 ────────────────────────────────────────────
function sendGuardianMsg() {
    const input = document.getElementById('guardianMsgInput');
    const content = input.value.trim();
    if (!content) { showToast('메시지를 입력해주세요'); return; }
    addMessage('보호자 (나)', content, true);
    input.value = '';
    renderGuardianApp();
    renderFamilyApp();
    renderElderApp();
    setTimeout(scrollGuardianChatToBottom, 100);
}

function sendGuardianQuick(text) {
    addMessage('보호자 (나)', text, true);
    renderGuardianApp();
    renderFamilyApp();
    renderElderApp();
    setTimeout(scrollGuardianChatToBottom, 100);
}

function scrollGuardianChatToBottom() {
    const el = document.getElementById('guardianChatList');
    if (el) el.scrollTop = el.scrollHeight;
}
