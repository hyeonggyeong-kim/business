// 앱 초기화 및 공통 유틸

function init() {
    // 로딩 스피너
    document.querySelectorAll('.screen').forEach(s => {
        s.innerHTML = '<div class="loading"><div class="loading-spinner"></div>로딩 중...</div>';
    });

    setTimeout(() => {
        renderGuardianApp();
        renderFamilyApp();
        renderElderApp();
    }, 400);

    updateStatusTimes();
    setInterval(updateStatusTimes, 30000);
    setInterval(simulateHealthData, 6000);
}

function updateStatusTimes() {
    const now = new Date();
    const t = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    document.querySelectorAll('.status-time').forEach(el => el.textContent = t);
}

function simulateHealthData() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour <= 22) {
        appData.healthData.steps += Math.floor(Math.random() * 80) + 30;
    } else {
        appData.healthData.steps += Math.floor(Math.random() * 5);
    }
    appData.healthData.heartRate = Math.floor(Math.random() * 14) + 68;

    const mins = Math.floor(Math.random() * 180);
    appData.healthData.lastActive = mins < 60 ? `${mins}분 전` : `${Math.floor(mins / 60)}시간 전`;

    if (guardianCurrentScreen === 'dashboard') renderGuardianApp();
}

// 토스트
let toastTimer = null;
function showToast(message) {
    const el = document.getElementById('appToast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

window.addEventListener('DOMContentLoaded', init);
