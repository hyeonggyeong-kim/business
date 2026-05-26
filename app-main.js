// 앱 초기화 및 공통 유틸

function init() {
    document.querySelectorAll('.screen').forEach(s => {
        s.innerHTML = '<div class="loading"><div class="loading-spinner"></div>로딩 중...</div>';
    });

    setTimeout(() => {
        renderCareApp();
        renderElderApp();
    }, 400);

    updateStatusTimes();
    setInterval(updateStatusTimes, 30000);
    setInterval(simulateHealthData, 6000);
    setInterval(updateHeartRateDisplay, 1500);
}

function updateStatusTimes() {
    const now = new Date();
    const t = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    document.querySelectorAll('.status-time').forEach(el => el.textContent = t);
}

function simulateHealthData() {
    const hour = new Date().getHours();
    if (!appData.alertActive) {
        if (hour >= 6 && hour <= 22) {
            appData.healthData.steps += Math.floor(Math.random() * 80) + 30;
        }
        appData.healthData.lastActive = `${Math.floor(Math.random() * 10) + 1}분 전`;
    }
    appData.healthData.heartRate = Math.floor(Math.random() * 14) + 68;

    if (careCurrentTab === 'status') renderCareApp();
}

function updateHeartRateDisplay() {
    const delta = Math.floor(Math.random() * 7) - 3;
    const next = Math.max(62, Math.min(88, appData.healthData.heartRate + delta));
    appData.healthData.heartRate = next;

    const el = document.getElementById('heartRateDisplay');
    if (!el) return;
    el.textContent = next;
    el.classList.remove('hr-flash');
    void el.offsetWidth;
    el.classList.add('hr-flash');
}

// ── 토스트 ─────────────────────────────────────────────────
let toastTimer = null;
function showToast(message) {
    const el = document.getElementById('appToast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
}

// ── 데모 시나리오 ──────────────────────────────────────────
function demoTriggerAlert() {
    appData.alertActive = true;
    appData.healthData.lastActive = '2시간 전';
    appData.weeklyData.steps[5] = 1200;

    const existing = appData.alerts.find(a => !a.resolved);
    if (!existing) {
        appData.alerts.unshift({
            id: Date.now(),
            type: '활동 없음',
            desc: '2시간 이상 움직임이 감지되지 않았어요',
            time: getCurrentTime(),
            read: false,
            resolved: false
        });
    }

    careCurrentTab = 'status';
    renderCareApp();
    renderElderApp();
    showToast('⚠️ 이상 알림이 가족 전원에게 발송됐어요');

    document.getElementById('btn-trigger').disabled = true;
    document.getElementById('btn-resolve').disabled = false;
}

function demoResolve() {
    appData.alertActive = false;
    appData.alerts.forEach(a => { a.resolved = true; a.read = true; });
    appData.healthData.lastActive = '5분 전';
    appData.healthData.steps += 400;
    appData.weeklyData.steps[5] = appData.healthData.steps;

    addMessage('보호자 (나)', '통화했어요. 주무시다 일어나셨대요 😊', true);

    careCurrentTab = 'chat';
    renderCareApp();
    renderElderApp();
    showToast('✓ 상황이 해결됐어요');

    document.getElementById('btn-trigger').disabled = false;
    document.getElementById('btn-resolve').disabled = true;
}

window.addEventListener('DOMContentLoaded', init);
