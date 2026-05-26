// 가족 케어 앱 (보호자/가족 통합)
let careCurrentTab = 'status';

function renderCareApp() {
    const screen = document.getElementById('careScreen');
    switch (careCurrentTab) {
        case 'status':   screen.innerHTML = renderStatusTab();   break;
        case 'analysis': screen.innerHTML = renderAnalysisTab(); break;
        case 'chat':
            screen.innerHTML = renderChatTab();
            setTimeout(() => {
                const el = document.getElementById('careChatList');
                if (el) el.scrollTop = el.scrollHeight;
            }, 100);
            break;
        case 'alerts':   screen.innerHTML = renderAlertsTab();   break;
    }
}

function careNav(active) {
    const unread = appData.alerts.filter(a => !a.read).length;
    const badge = unread > 0 ? `<span class="badge">${unread}</span>` : '';
    return `
        <div class="bottom-nav">
            <button class="nav-btn ${active === 'status' ? 'active' : ''}" onclick="showCareTab('status')">
                <span class="nav-icon">🏃</span>상태
            </button>
            <button class="nav-btn ${active === 'analysis' ? 'active' : ''}" onclick="showCareTab('analysis')">
                <span class="nav-icon">📊</span>분석
            </button>
            <button class="nav-btn ${active === 'chat' ? 'active' : ''}" onclick="showCareTab('chat')">
                <span class="nav-icon">💬</span>채팅
            </button>
            <button class="nav-btn ${active === 'alerts' ? 'active' : ''}" onclick="showCareTab('alerts')">
                <span class="nav-icon">🔔</span>알림${badge}
            </button>
        </div>
    `;
}

// ── 상태 탭 ───────────────────────────────────────────────
function renderStatusTab() {
    const { steps, heartRate, sleep, lastActive, watchBattery } = appData.healthData;
    const stepsGoal = 5000;
    const stepsPercent = Math.min(100, Math.round(steps / stepsGoal * 100));
    const alertBanner = appData.alertActive ? `
        <div class="alert-banner" onclick="showCareTab('alerts')" style="cursor:pointer">
            <div class="alert-dot"></div>
            2시간 이상 움직임이 감지되지 않았어요
        </div>` : '';

    return `
        <div class="screen-content">
            <div class="header">
                <div class="elder-name">김순자 어머니</div>
                <div class="last-update">
                    워치 연동 중
                    <button class="refresh-btn" onclick="refreshStatus()">🔄</button>
                </div>
            </div>
            ${alertBanner}

            <!-- 심박수 -->
            <div class="watch-card ${appData.alertActive ? '' : ''}">
                <div class="watch-card-header">
                    <span class="watch-card-icon">❤️</span>
                    <span class="watch-card-title">심박수</span>
                    <span class="heart-pulse ${appData.alertActive ? '' : 'pulse-normal'}"></span>
                </div>
                <div class="watch-card-value"><span id="heartRateDisplay">${heartRate}</span> <span class="watch-unit">bpm</span></div>
                <div class="hr-wave">
                    <div class="hr-bar" style="--d:0s;--h:6px"></div>
                    <div class="hr-bar" style="--d:0.1s;--h:14px"></div>
                    <div class="hr-bar" style="--d:0.15s;--h:28px"></div>
                    <div class="hr-bar" style="--d:0.05s;--h:8px"></div>
                    <div class="hr-bar" style="--d:0.2s;--h:20px"></div>
                    <div class="hr-bar" style="--d:0.1s;--h:6px"></div>
                    <div class="hr-bar" style="--d:0.25s;--h:18px"></div>
                    <div class="hr-bar" style="--d:0.15s;--h:10px"></div>
                    <div class="hr-bar" style="--d:0.0s;--h:24px"></div>
                    <div class="hr-bar" style="--d:0.3s;--h:6px"></div>
                </div>
                <div class="card-status status-normal" style="display:inline-block">정상 범위 (60–100 bpm)</div>
            </div>

            <!-- 걸음수 -->
            <div class="watch-card">
                <div class="watch-card-header">
                    <span class="watch-card-icon">👟</span>
                    <span class="watch-card-title">걸음수</span>
                    <span style="font-size:12px;color:#999;margin-left:auto">${stepsPercent}% 달성</span>
                </div>
                <div class="watch-card-value">${steps.toLocaleString()} <span class="watch-unit">걸음</span></div>
                <div class="progress-bar-wrap">
                    <div class="progress-bar" style="width:${stepsPercent}%"></div>
                </div>
                <div class="progress-label">목표 ${stepsGoal.toLocaleString()} 걸음</div>
            </div>

            <!-- 수면 / 마지막 활동 -->
            <div class="watch-row">
                <div class="watch-card-sm">
                    <div class="watch-card-icon-sm">🌙</div>
                    <div class="watch-card-sm-label">어젯밤 수면</div>
                    <div class="watch-card-sm-value">${sleep}</div>
                    <div class="card-status status-normal" style="font-size:10px;padding:2px 8px">양호</div>
                </div>
                <div class="watch-card-sm ${appData.alertActive ? 'watch-card-sm-danger' : ''}">
                    <div class="watch-card-icon-sm">⏱️</div>
                    <div class="watch-card-sm-label">마지막 활동</div>
                    <div class="watch-card-sm-value">${lastActive}</div>
                    <div class="card-status ${appData.alertActive ? 'status-danger' : 'status-normal'}" style="font-size:10px;padding:2px 8px">
                        ${appData.alertActive ? '주의' : '정상'}
                    </div>
                </div>
            </div>

            <!-- 워치 배터리 -->
            <div class="watch-battery-row">
                <span style="font-size:12px;color:#bbb">워치 배터리</span>
                <div class="battery-bar-wrap">
                    <div class="battery-bar" style="width:${watchBattery}%"></div>
                </div>
                <span style="font-size:12px;color:#999;font-weight:600">${watchBattery}%</span>
            </div>

            <!-- 가족 확인 현황 -->
            <div class="family-check-section">
                <div class="section-label">가족 확인 현황</div>
                <div class="family-check-list">
                    <div class="family-check-item checked">
                        <div class="check-avatar">아</div>
                        <div class="check-name">아들 (김철수)</div>
                        <div class="check-mark">✓</div>
                    </div>
                    <div class="family-check-item checked">
                        <div class="check-avatar">딸</div>
                        <div class="check-name">딸 (김민지)</div>
                        <div class="check-mark">✓</div>
                    </div>
                    <div class="family-check-item ${appData.checkedMembers.includes('보호자 (나)') ? 'checked' : ''}">
                        <div class="check-avatar">나</div>
                        <div class="check-name">보호자 (나)</div>
                        <div class="check-mark">${appData.checkedMembers.includes('보호자 (나)') ? '✓' : '—'}</div>
                    </div>
                </div>
            </div>
        </div>
        ${careNav('status')}
    `;
}

function refreshStatus() {
    simulateHealthData();
    renderCareApp();
}

// ── 분석 탭 ───────────────────────────────────────────────
function renderAnalysisTab() {
    const { labels, steps, heartRate, sleep } = appData.weeklyData;
    const maxSteps = 6000;
    const todayIdx = 5; // 토요일

    const stepsAvg = Math.round(steps.slice(0, 6).reduce((a, b) => a + b, 0) / 6);
    const hrAvg    = Math.round(heartRate.slice(0, 6).reduce((a, b) => a + b, 0) / 6);
    const sleepAvg = (sleep.slice(0, 6).reduce((a, b) => a + b, 0) / 6).toFixed(1);

    const stepsBarHtml = steps.map((s, i) => {
        const h = Math.max(4, Math.round((s / maxSteps) * 72));
        const isToday = i === todayIdx;
        const isEmpty = s === 0;
        return `
            <div class="bar-col">
                <div class="bar ${isToday ? 'bar-today' : ''} ${isEmpty ? 'bar-empty' : ''}"
                     style="height:${isEmpty ? 4 : h}px"></div>
                <div class="bar-label ${isToday ? 'bar-label-today' : ''}">${labels[i]}</div>
            </div>
        `;
    }).join('');

    const hrBarHtml = heartRate.map((hr, i) => {
        const h = Math.max(4, Math.round(((hr - 60) / 30) * 60));
        const isEmpty = hr === 0;
        return `
            <div class="bar-col">
                <div class="bar bar-hr ${i === todayIdx ? 'bar-hr-today' : ''} ${isEmpty ? 'bar-empty' : ''}"
                     style="height:${isEmpty ? 4 : h}px"></div>
                <div class="bar-label">${labels[i]}</div>
            </div>
        `;
    }).join('');

    return `
        <div class="screen-content">
            <div class="header row">
                <button class="back-btn" onclick="showCareTab('status')">‹</button>
                <div>
                    <div class="header-title">주간 분석</div>
                    <div style="font-size:11px;opacity:0.75;margin-top:2px">최근 7일 기준</div>
                </div>
            </div>

            <!-- 주간 요약 -->
            <div class="analysis-summary">
                <div class="summary-item">
                    <div class="summary-val">${stepsAvg.toLocaleString()}</div>
                    <div class="summary-label">평균 걸음수</div>
                </div>
                <div class="summary-divider"></div>
                <div class="summary-item">
                    <div class="summary-val">${hrAvg}</div>
                    <div class="summary-label">평균 심박 bpm</div>
                </div>
                <div class="summary-divider"></div>
                <div class="summary-item">
                    <div class="summary-val">${sleepAvg}h</div>
                    <div class="summary-label">평균 수면</div>
                </div>
            </div>

            <!-- 걸음수 차트 -->
            <div class="chart-card">
                <div class="chart-title">일별 걸음수 <span class="chart-goal">목표 5,000</span></div>
                <div class="bar-chart">${stepsBarHtml}</div>
                <div class="chart-goal-line" style="bottom: ${Math.round((5000/maxSteps)*72) + 28}px"></div>
            </div>

            <!-- 심박수 차트 -->
            <div class="chart-card">
                <div class="chart-title">일별 평균 심박수</div>
                <div class="bar-chart">${hrBarHtml}</div>
            </div>

            <!-- 위험 신호 -->
            <div class="insight-card">
                <div class="insight-title">💡 이번 주 인사이트</div>
                <div class="insight-item ${appData.alertActive ? 'insight-warn' : 'insight-ok'}">
                    ${appData.alertActive
                        ? '⚠️ 오늘 활동량이 평소 대비 68% 감소했어요'
                        : '✓ 이번 주 활동량이 지난 주 대비 12% 증가했어요'}
                </div>
                <div class="insight-item insight-ok">✓ 수면 시간이 7일 연속 6시간 이상 유지됐어요</div>
                <div class="insight-item insight-ok">✓ 심박수가 정상 범위(60–100 bpm)를 유지 중이에요</div>
            </div>
        </div>
        ${careNav('analysis')}
    `;
}

// ── 채팅 탭 ───────────────────────────────────────────────
function renderChatTab() {
    const messagesHtml = appData.messages.map(msg => `
        <div class="msg ${msg.isMe ? 'me' : ''}">
            <div class="msg-header">${msg.sender} · ${msg.time}</div>
            <div class="msg-bubble">${msg.content}</div>
        </div>
    `).join('');

    const unresolvedAlert = appData.alerts.find(a => !a.resolved);
    const resolveBtn = unresolvedAlert
        ? `<button class="quick-btn" onclick="markAlertResolved()">✓ 해결 완료</button>` : '';

    return `
        <div class="header row">
            <button class="back-btn" onclick="showCareTab('status')">‹</button>
            <div class="header-title">가족 채팅</div>
            <div class="header-sub">구성원 3명</div>
        </div>
        ${appData.alertActive ? `
        <div class="alert-context">
            ⚠️ 오후 2:00 – 움직임 없음 감지됨
            ${resolveBtn}
        </div>` : ''}
        <div class="chat-list" id="careChatList">${messagesHtml}</div>
        <div class="quick-reply">
            <button class="quick-btn" onclick="sendCareQuick('내가 전화할게')">📞 내가 전화할게</button>
            <button class="quick-btn" onclick="sendCareQuick('확인했어')">✓ 확인했어</button>
            <button class="quick-btn" onclick="sendCareQuick('괜찮으신 것 같아')">😌 괜찮으신 것 같아</button>
        </div>
        <div class="input-area">
            <input type="text" class="msg-input" id="careMsgInput" placeholder="메시지 입력..."
                   onkeydown="if(event.key==='Enter') sendCareMsg()">
            <button class="send-btn" onclick="sendCareMsg()">↑</button>
        </div>
    `;
}

function markAlertResolved() {
    const unresolved = appData.alerts.find(a => !a.resolved);
    if (unresolved) {
        resolveAlert(unresolved.id);
        appData.alertActive = false;
        showToast('알림이 해결됨으로 표시됐어요');
        renderCareApp();
        renderElderApp();
    }
}

// ── 알림 탭 ───────────────────────────────────────────────
function renderAlertsTab() {
    const alertsHtml = appData.alerts.map(alert => {
        const cls = alert.resolved ? 'resolved' : '';
        const prefix = alert.resolved ? '✓ 해결됨 · ' : '⚠️ 미해결 · ';
        return `
            <div class="alert-item ${cls}" onclick="goToAlertChat(${alert.id})">
                <div class="alert-type">${prefix}${alert.type}</div>
                <div class="alert-desc">${alert.desc}</div>
                <div class="alert-time">${alert.time}</div>
            </div>
        `;
    }).join('');

    return `
        <div class="screen-content">
            <div class="header row">
                <button class="back-btn" onclick="showCareTab('status')">‹</button>
                <div class="header-title">알림</div>
            </div>
            <div class="alert-list">${alertsHtml}</div>
        </div>
        ${careNav('alerts')}
    `;
}

function goToAlertChat(alertId) {
    const alert = appData.alerts.find(a => a.id === alertId);
    if (alert) alert.read = true;
    showCareTab('chat');
}

// ── 화면 전환 ──────────────────────────────────────────────
function showCareTab(tab) {
    careCurrentTab = tab;
    if (tab === 'status') {
        incrementCheckCount('보호자 (나)');
        renderElderApp();
    }
    renderCareApp();
}

// ── 메시지 전송 ────────────────────────────────────────────
function sendCareMsg() {
    const input = document.getElementById('careMsgInput');
    const content = input.value.trim();
    if (!content) { showToast('메시지를 입력해주세요'); return; }
    addMessage('보호자 (나)', content, true);
    input.value = '';
    renderCareApp();
    renderElderApp();
    setTimeout(() => {
        const el = document.getElementById('careChatList');
        if (el) el.scrollTop = el.scrollHeight;
    }, 100);
}

function sendCareQuick(text) {
    addMessage('보호자 (나)', text, true);
    renderCareApp();
    renderElderApp();
    setTimeout(() => {
        const el = document.getElementById('careChatList');
        if (el) el.scrollTop = el.scrollHeight;
    }, 100);
}
