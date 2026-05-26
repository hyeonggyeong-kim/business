// 전역 데이터
const appData = {
    messages: [
        { sender: '딸 (김민지)', content: '내가 전화해볼게', time: '14:05', isMe: false },
        { sender: '보호자 (나)', content: '주무시고 계셨대요', time: '14:12', isMe: true },
        { sender: '아들 (김철수)', content: '다행이네요. 저녁에 제가 들를게요', time: '14:15', isMe: false }
    ],

    alerts: [
        { id: 1, type: '활동 없음', desc: '2시간 이상 움직임이 감지되지 않았어요', time: '14:02', read: false, resolved: false },
        { id: 2, type: '심박 이상', desc: '심박수가 정상 범위를 벗어났어요 (135 bpm)', time: '어제 22:15', read: true, resolved: true },
        { id: 3, type: '활동 없음', desc: '3시간 이상 움직임이 감지되지 않았어요', time: '어제 15:30', read: true, resolved: true }
    ],

    checkCount: 2,
    checkedMembers: ['김철수', '김민지'],

    healthData: {
        steps: 1200,
        heartRate: 72,
        sleep: '7시간 20분',
        lastActive: '2시간 전',
        watchBattery: 68
    },

    // 7일 추이 (월~일, 오늘=토)
    weeklyData: {
        labels: ['월', '화', '수', '목', '금', '토', '일'],
        steps:     [3800, 5200, 2100, 4600, 3900, 1200, 0],
        heartRate: [71,   74,   72,   76,   73,   72,   0],
        sleep:     [6.5,  7.2,  5.8,  7.0,  6.8,  7.3,  0]
    },

    alertActive: true
};

function getCurrentTime() {
    const now = new Date();
    return `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function addMessage(sender, content, isMe) {
    appData.messages.push({ sender, content, time: getCurrentTime(), isMe });
}

function incrementCheckCount(memberName) {
    if (!appData.checkedMembers.includes(memberName)) {
        appData.checkCount++;
        appData.checkedMembers.push(memberName);
    }
}

function resolveAlert(alertId) {
    const alert = appData.alerts.find(a => a.id === alertId);
    if (alert) alert.resolved = true;
}
