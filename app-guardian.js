// 보호자 앱 렌더링
let guardianCurrentScreen = 'dashboard'; // dashboard, chat, alerts, settings, schedule, calendar

function renderGuardianApp() {
    const screen = document.getElementById('guardianScreen');
    
    switch(guardianCurrentScreen) {
        case 'dashboard':
            screen.innerHTML = renderGuardianDashboard();
            break;
        case 'chat':
            screen.innerHTML = renderGuardianChat();
            setTimeout(scrollChatToBottom, 100);
            break;
        case 'alerts':
            screen.innerHTML = renderGuardianAlerts();
            break;
        case 'settings':
            screen.innerHTML = renderGuardianSettings();
            break;
        case 'schedule':
            screen.innerHTML = renderGuardianSchedule();
            break;
        case 'calendar':
            screen.innerHTML = renderGuardianCalendar();
            break;
    }
}

function renderGuardianDashboard() {
    const unreadCount = appData.alerts.filter(a => !a.read).length;
    const unresolvedAlert = appData.alerts.find(a => !a.resolved);
    
    return `
        <div class="screen-content">
            <div class="header">
                <div class="elder-name">김순자 어머니</div>
                <div class="last-update" id="lastUpdate">
                    마지막 업데이트: ${getCurrentTime()}
                    <button class="refresh-btn" onclick="refreshHealthData()">🔄</button>
                </div>
            </div>

            ${unresolvedAlert ? `<div class="alert-banner">
                ⚠️ 2시간 이상 움직임이 감지되지 않았어요
            </div>` : ''}

            <div class="cards">
                <div class="card ${unresolvedAlert ? 'danger' : ''}">
                    <div class="card-title">활동량</div>
                    <div class="card-value">${appData.healthData.steps.toLocaleString()} 걸음</div>
                    <div class="card-status ${unresolvedAlert ? 'status-danger' : 'status-normal'}">마지막 움직임: ${appData.healthData.lastActive}</div>
                </div>

                <div class="card">
                    <div class="card-title">심박수</div>
                    <div class="card-value">${appData.healthData.heartRate} bpm</div>
                    <div class="card-status status-normal">정상</div>
                </div>

                <div class="card">
                    <div class="card-title">수면</div>
                    <div class="card-value">${appData.healthData.sleep}</div>
                    <div class="card-status status-normal">정상</div>
                </div>
            </div>
        </div>

        <div class="bottom-nav">
            <button class="nav-btn active" onclick="showGuardianScreen('dashboard')">홈</button>
            <button class="nav-btn" onclick="showGuardianScreen('chat')">채팅</button>
            <button class="nav-btn" onclick="showGuardianScreen('schedule')">역할</button>
            <button class="nav-btn" onclick="showGuardianScreen('alerts')">
                알림${unreadCount > 0 ? ` <span class="badge">${unreadCount}</span>` : ''}
            </button>
        </div>
    `;
}

function refreshHealthData() {
    simulateHealthData();
    renderGuardianApp();
}


function renderGuardianChat() {
    const messagesHtml = appData.messages.map(msg => `
        <div class="msg ${msg.isGuardian ? 'me' : ''}">
            <div class="msg-header">${msg.sender} · ${msg.time}</div>
            <div class="msg-bubble">${msg.content}</div>
        </div>
    `).join('');
    
    const unresolvedAlert = appData.alerts.find(a => !a.resolved);

    return `
        <div class="header" style="display: flex; align-items: center;">
            <button class="back-btn" onclick="showGuardianScreen('dashboard')">←</button>
            <div class="header-title">가족 채팅</div>
        </div>

        <div class="alert-context">
            ⚠️ 오후 2시 – 움직임 없음 감지됨
            ${unresolvedAlert ? `<button class="quick-btn" style="margin-left: 12px;" onclick="markAlertResolved()">해결 완료</button>` : ''}
        </div>

        <div class="chat-list" id="guardianChatList">
            ${messagesHtml}
        </div>

        <div class="quick-reply">
            <button class="quick-btn" onclick="sendGuardianQuick('내가 전화할게')">내가 전화할게</button>
            <button class="quick-btn" onclick="sendGuardianQuick('확인했어')">확인했어</button>
            <button class="quick-btn" onclick="sendGuardianQuick('괜찮으신 것 같아')">괜찮으신 것 같아</button>
        </div>

        <div class="input-area">
            <input type="text" class="msg-input" id="guardianMsgInput" placeholder="메시지 입력" 
                   onkeypress="if(event.key==='Enter') sendGuardianMsg()">
            <button class="send-btn" onclick="sendGuardianMsg()">전송</button>
        </div>
    `;
}

function markAlertResolved() {
    const unresolvedAlert = appData.alerts.find(a => !a.resolved);
    if (unresolvedAlert) {
        resolveAlert(unresolvedAlert.id);
        renderGuardianApp();
    }
}

function renderGuardianAlerts() {
    const alertsHtml = appData.alerts.map(alert => {
        const resolvedClass = alert.resolved ? 'resolved' : '';
        const resolvedText = alert.resolved ? ' ✓ 해결됨' : '';
        
        return `
        <div class="alert-item ${resolvedClass}" onclick="showAlertDetail(${alert.id})">
            <div class="alert-type">${alert.type}${resolvedText}</div>
            <div class="alert-desc">${alert.desc}</div>
            <div class="alert-time">${alert.time}</div>
        </div>
    `;
    }).join('');

    return `
        <div class="header">
            <div class="elder-name">알림 목록</div>
        </div>

        <div class="alert-list">
            ${alertsHtml}
        </div>

        <div class="bottom-nav">
            <button class="nav-btn" onclick="showGuardianScreen('dashboard')">홈</button>
            <button class="nav-btn" onclick="showGuardianScreen('chat')">채팅</button>
            <button class="nav-btn" onclick="showGuardianScreen('schedule')">역할</button>
            <button class="nav-btn active" onclick="showGuardianScreen('alerts')">알림</button>
        </div>
    `;
}

function showAlertDetail(alertId) {
    const alert = appData.alerts.find(a => a.id === alertId);
    if (!alert) return;
    
    alert.read = true;
    
    // 채팅방으로 이동
    showGuardianScreen('chat');
}

function renderGuardianSettings() {
    return `
        <div class="header">
            <div class="elder-name">설정</div>
        </div>

        <div class="settings-list">
            <div class="setting-item" onclick="toggleSetting('notifications')">
                <div class="setting-label">알림 받기</div>
                <div class="setting-value">${appData.settings.notifications ? 'ON' : 'OFF'}</div>
            </div>
            <div class="setting-item" onclick="toggleSetting('sound')">
                <div class="setting-label">알림 소리</div>
                <div class="setting-value">${appData.settings.sound ? 'ON' : 'OFF'}</div>
            </div>
            <div class="setting-item" onclick="toggleSetting('vibration')">
                <div class="setting-label">진동</div>
                <div class="setting-value">${appData.settings.vibration ? 'ON' : 'OFF'}</div>
            </div>
            <div class="setting-item">
                <div class="setting-label">앱 버전</div>
                <div class="setting-value">1.0.0</div>
            </div>
        </div>

        <div class="bottom-nav">
            <button class="nav-btn" onclick="showGuardianScreen('dashboard')">홈</button>
            <button class="nav-btn" onclick="showGuardianScreen('chat')">채팅</button>
            <button class="nav-btn" onclick="showGuardianScreen('alerts')">알림</button>
            <button class="nav-btn active" onclick="showGuardianScreen('settings')">설정</button>
        </div>
    `;
}

function showGuardianScreen(screen) {
    guardianCurrentScreen = screen;
    
    // 대시보드 진입 시 확인 카운트 증가
    if (screen === 'dashboard') {
        incrementCheckCount('보호자 (나)');
        renderElderApp();
    }
    
    renderGuardianApp();
}

function sendGuardianMsg() {
    const input = document.getElementById('guardianMsgInput');
    const content = input.value.trim();
    
    if (!content) {
        showToast('메시지를 입력해주세요');
        return;
    }
    
    addMessage('보호자 (나)', content, true);
    input.value = '';
    
    renderGuardianApp();
    renderFamilyApp();
    renderElderApp();
    
    setTimeout(scrollChatToBottom, 100);
}

function sendGuardianQuick(text) {
    addMessage('보호자 (나)', text, true);
    renderGuardianApp();
    renderFamilyApp();
    renderElderApp();
    setTimeout(scrollChatToBottom, 100);
}

function showToast(message) {
    // 간단한 토스트 메시지 (실제로는 더 나은 UI 필요)
    console.log('Toast:', message);
}

function toggleSetting(key) {
    appData.settings[key] = !appData.settings[key];
    renderGuardianApp();
}

function scrollChatToBottom() {
    const chatList = document.getElementById('guardianChatList');
    if (chatList) {
        chatList.scrollTop = chatList.scrollHeight;
    }
}

function renderGuardianSchedule() {
    const scheduleHtml = appData.schedule.assignments.map((item, index) => {
        const statusClass = item.status === 'confirmed' ? 'status-normal' : 'status-warning';
        const statusText = item.status === 'confirmed' ? '확정' : '대기중';
        
        return `
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div class="card-title">${item.day}</div>
                        <div style="font-size: 16px; margin: 8px 0;">${item.member}</div>
                        <div style="font-size: 14px; color: #666;">${item.task}</div>
                    </div>
                    <div>
                        <div class="card-status ${statusClass}">${statusText}</div>
                        ${item.status === 'pending' && item.member === '보호자 (나)' ? 
                            `<button class="quick-btn" style="margin-top: 8px;" onclick="confirmSchedule(${index})">수락</button>` 
                            : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="header">
            <div class="elder-name">이번 주 역할 분담</div>
            <div class="last-update">
                주간: ${appData.schedule.weekStart} ~
                <button class="refresh-btn" onclick="showGuardianScreen('calendar')">📅</button>
            </div>
        </div>

        <div class="cards">
            ${scheduleHtml}
        </div>

        <div class="bottom-nav">
            <button class="nav-btn" onclick="showGuardianScreen('dashboard')">홈</button>
            <button class="nav-btn" onclick="showGuardianScreen('chat')">채팅</button>
            <button class="nav-btn active" onclick="showGuardianScreen('schedule')">역할</button>
            <button class="nav-btn" onclick="showGuardianScreen('alerts')">알림</button>
        </div>
    `;
}

function renderGuardianCalendar() {
    const { currentMonth, currentYear, events } = appData.calendar;
    const selectedDate = appData.calendar.selectedDate || null;
    
    // 월 이름
    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    
    // 해당 월의 첫날과 마지막날
    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    const lastDay = new Date(currentYear, currentMonth, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0=일요일
    
    // 캘린더 그리드 생성
    let calendarHtml = '<div class="calendar-grid">';
    
    // 요일 헤더
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    dayNames.forEach(day => {
        calendarHtml += `<div class="calendar-day-header">${day}</div>`;
    });
    
    // 빈 칸 (이전 달)
    for (let i = 0; i < startDayOfWeek; i++) {
        calendarHtml += '<div class="calendar-day empty"></div>';
    }
    
    // 날짜 칸
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayEvents = events.filter(e => e.date === dateStr);
        const isToday = day === 16; // 임시로 16일을 오늘로 설정
        const isSelected = selectedDate === dateStr;
        
        let eventDots = '';
        if (dayEvents.length > 0) {
            eventDots = '<div class="event-dots">';
            dayEvents.forEach(evt => {
                const dotClass = evt.type === 'visit' ? 'dot-visit' : evt.type === 'call' ? 'dot-call' : 'dot-medical';
                eventDots += `<span class="event-dot ${dotClass}"></span>`;
            });
            eventDots += '</div>';
        }
        
        calendarHtml += `
            <div class="calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}" onclick="selectDate('${dateStr}')">
                <div class="day-number">${day}</div>
                ${eventDots}
            </div>
        `;
    }
    
    calendarHtml += '</div>';
    
    // 필터링된 이벤트 목록
    const filteredEvents = selectedDate 
        ? events.filter(e => e.date === selectedDate)
        : events;
    
    const eventListHtml = filteredEvents.length > 0 
        ? filteredEvents.map(evt => {
            const typeIcon = evt.type === 'visit' ? '🏠' : evt.type === 'call' ? '📞' : '🏥';
            const typeText = evt.type === 'visit' ? '방문' : evt.type === 'call' ? '전화' : '병원';
            
            return `
                <div class="event-item">
                    <div class="event-icon">${typeIcon}</div>
                    <div class="event-info">
                        <div class="event-title">${evt.title}</div>
                        <div class="event-date">${evt.date} · ${typeText}</div>
                    </div>
                </div>
            `;
        }).join('')
        : '<div style="text-align: center; padding: 20px; color: #999;">일정이 없습니다</div>';

    const sectionTitle = selectedDate 
        ? `${selectedDate} 일정`
        : '이번 달 일정';

    return `
        <div class="screen-content">
            <div class="header">
                <button class="back-btn" onclick="showGuardianScreen('schedule')">←</button>
                <div class="elder-name">${monthNames[currentMonth - 1]} ${currentYear}</div>
                <button class="refresh-btn" onclick="addCalendarEvent()">➕</button>
            </div>

            ${calendarHtml}

            <div class="event-list-section">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <div class="section-title">${sectionTitle}</div>
                    ${selectedDate ? `<button class="quick-btn" onclick="clearDateSelection()">전체보기</button>` : ''}
                </div>
                ${eventListHtml}
            </div>
        </div>

        <div class="bottom-nav">
            <button class="nav-btn" onclick="showGuardianScreen('dashboard')">홈</button>
            <button class="nav-btn" onclick="showGuardianScreen('chat')">채팅</button>
            <button class="nav-btn active" onclick="showGuardianScreen('schedule')">역할</button>
            <button class="nav-btn" onclick="showGuardianScreen('alerts')">알림</button>
        </div>
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

function showDayEvents(dateStr) {
    selectDate(dateStr);
}

function addCalendarEvent() {
    const title = prompt('일정 제목을 입력하세요:');
    if (!title) return;
    
    const date = prompt('날짜를 입력하세요 (YYYY-MM-DD):');
    if (!date) return;
    
    const type = prompt('유형을 입력하세요 (visit/call/medical):') || 'call';
    
    appData.calendar.events.push({
        date: date,
        title: title,
        type: type
    });
    
    // 날짜순 정렬
    appData.calendar.events.sort((a, b) => a.date.localeCompare(b.date));
    
    renderGuardianApp();
}


function confirmSchedule(index) {
    appData.schedule.assignments[index].status = 'confirmed';
    renderGuardianApp();
}
