// 전역 데이터
const appData = {
    messages: [
        { sender: '딸 (김민지)', content: '내가 전화해볼게', time: '14:05', isGuardian: false },
        { sender: '보호자 (나)', content: '주무시고 계셨대요', time: '14:12', isGuardian: true },
        { sender: '아들 (김철수)', content: '다행이네요. 저녁에 제가 들를게요', time: '14:15', isGuardian: false }
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
        lastActive: '2시간 전'
    },
    
    settings: {
        notifications: true,
        sound: true,
        vibration: true
    },
    
    schedule: {
        weekStart: '2025-04-14',
        assignments: [
            { day: '월요일', date: '2025-04-14', member: '아들 (김철수)', task: '전화', status: 'confirmed' },
            { day: '화요일', date: '2025-04-15', member: '딸 (김민지)', task: '전화', status: 'confirmed' },
            { day: '수요일', date: '2025-04-16', member: '보호자 (나)', task: '전화', status: 'pending' },
            { day: '목요일', date: '2025-04-17', member: '딸 (김민지)', task: '방문', status: 'pending' },
            { day: '금요일', date: '2025-04-18', member: '아들 (김철수)', task: '전화', status: 'pending' },
            { day: '토요일', date: '2025-04-19', member: '보호자 (나)', task: '방문', status: 'pending' },
            { day: '일요일', date: '2025-04-20', member: '전체', task: '휴식', status: 'confirmed' }
        ]
    },
    
    calendar: {
        currentMonth: 4, // 4월
        currentYear: 2025,
        events: [
            { date: '2025-04-14', title: '아들 전화', type: 'call' },
            { date: '2025-04-15', title: '딸 전화', type: 'call' },
            { date: '2025-04-16', title: '내가 전화', type: 'call' },
            { date: '2025-04-17', title: '딸 방문', type: 'visit' },
            { date: '2025-04-18', title: '아들 전화', type: 'call' },
            { date: '2025-04-19', title: '내가 방문', type: 'visit' },
            { date: '2025-04-21', title: '정기 검진', type: 'medical' },
            { date: '2025-04-25', title: '아들 방문', type: 'visit' }
        ]
    }
};

// 현재 시간 포맷
function getCurrentTime() {
    const now = new Date();
    return `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
}

// 메시지 추가
function addMessage(sender, content, isGuardian) {
    appData.messages.push({
        sender: sender,
        content: content,
        time: getCurrentTime(),
        isGuardian: isGuardian
    });
}

// 확인 카운트 증가
function incrementCheckCount(memberName) {
    if (!appData.checkedMembers.includes(memberName)) {
        appData.checkCount++;
        appData.checkedMembers.push(memberName);
    }
}

// 알림 해결 처리
function resolveAlert(alertId) {
    const alert = appData.alerts.find(a => a.id === alertId);
    if (alert) {
        alert.resolved = true;
    }
}
