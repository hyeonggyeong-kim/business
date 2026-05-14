// 앱 초기화 및 주기적 업데이트

let isLoading = false;

function init() {
    showLoading();
    
    setTimeout(() => {
        renderGuardianApp();
        renderFamilyApp();
        renderElderApp();
        hideLoading();
    }, 500);
    
    // 5초마다 건강 데이터 시뮬레이션
    setInterval(simulateHealthData, 5000);
}

function showLoading() {
    isLoading = true;
    document.querySelectorAll('.screen').forEach(screen => {
        screen.innerHTML = '<div class="loading">로딩 중...</div>';
    });
}

function hideLoading() {
    isLoading = false;
}

function simulateHealthData() {
    // 더 현실적인 건강 데이터 시뮬레이션
    const hour = new Date().getHours();
    
    // 시간대별 활동량 (낮에 더 많이 움직임)
    if (hour >= 6 && hour <= 22) {
        appData.healthData.steps += Math.floor(Math.random() * 100) + 50;
    } else {
        appData.healthData.steps += Math.floor(Math.random() * 10);
    }
    
    // 심박수 (정상 범위 내에서 변동)
    appData.healthData.heartRate = Math.floor(Math.random() * 15) + 68;
    
    // 마지막 활동 시간 업데이트
    const lastActiveMinutes = Math.floor(Math.random() * 180);
    if (lastActiveMinutes < 60) {
        appData.healthData.lastActive = `${lastActiveMinutes}분 전`;
    } else {
        appData.healthData.lastActive = `${Math.floor(lastActiveMinutes / 60)}시간 전`;
    }
    
    // 대시보드 화면일 때만 업데이트
    if (guardianCurrentScreen === 'dashboard') {
        renderGuardianApp();
    }
}

// 페이지 로드 시 초기화
window.addEventListener('DOMContentLoaded', init);
