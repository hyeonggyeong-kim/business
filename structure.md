# structure.md

> **프로젝트명**: 가족 공동 케어 앱 (Family Care)
> **팀명**: 7팀 | **팀장**: 정승혁 | **팀원**: 구민우, 김형경
> **플랫폼**: Android (Kotlin) + Wear OS | **외부 API**: Samsung Health

---

## 1. 전체 서비스 구조 개요

```
[Wear OS 앱 - 어르신 착용]
        │
        │  Samsung Health API (건강 데이터)
        ▼
[백엔드 서버]
  ├── 건강 데이터 수집 & 이상 감지 엔진
  ├── 알림 발송 (FCM)
  ├── 채팅 메시지 처리
  └── 역할 분담 스케줄 관리
        │
   REST API / WebSocket
        │
   ┌────┴────┐
   ▼         ▼
[보호자 앱]   [어르신 앱]
가족 대시보드  확인 현황 화면
채팅방        가족 메시지 확인
역할 분담
```

---

## 2. 사용자 유형 정의

| 유형 | 설명 | 사용 앱 | 주요 행동 |
|------|------|---------|-----------|
| **어르신 (Elder)** | 독거 어르신, 스마트워치 착용자 | 어르신용 Android 앱 + Wear OS 앱 | 건강 데이터 자동 전송, 가족 확인 현황 조회, 메시지 수신 |
| **보호자 (Guardian)** | 어르신의 자녀 또는 가족 구성원 | 보호자용 Android 앱 | 건강 데이터 조회, 알림 수신, 채팅, 역할 분담 참여
---

## 3. 권한 구조

| 기능 | 어르신 | 보호자 | 케어 관리자(향후) |
|------|--------|--------|-----------------|
| 건강 데이터 조회 | 본인만 (공개 설정 범위 내) | 가족 그룹 공유 | 담당 어르신 전체 |
| 이상 알림 수신 | ✗ | ✅ (그룹 전체) | ✅ |
| 채팅 참여 | ✅ (읽기/쓰기) | ✅ | ✗ |
| 역할 분담 설정 | ✗ | ✅ | ✗ |
| 데이터 공개 범위 설정 | ✅ (본인 설정) | ✗ | ✗ |
| 가족 그룹 초대 | ✗ | ✅ (그룹장) | ✗ |
| 어르신 확인 현황 조회 | ✅ (본인) | ✅ | ✅ |

---

## 4. 화면 목록

### 보호자 앱

| 화면 ID | 화면명 | 설명 |
|---------|--------|------|
| G-01 | 가족 그룹 대시보드 | 어르신 건강 요약 카드, 최근 알림, 오늘의 담당자 |
| G-02 | 건강 데이터 상세 | 심박수 / 활동량 / 수면 패턴 그래프 |
| G-03 | 이상 알림 목록 | 과거 이상 감지 이력, 대응 여부 표시 |
| G-04 | 가족 채팅방 | 알림 트리거 연결 채팅, 일반 대화 |
| G-05 | 역할 분담 화면 | 주간 케어 역할 제안 & 수락/수정 |
| G-06 | 그룹 설정 | 가족 구성원 초대/제거, 알림 설정 |
| G-07 | 알림 상세 | 개별 이상 알림 상세 및 채팅 바로가기 |

### 어르신 앱

| 화면 ID | 화면명 | 설명 |
|---------|--------|------|
| E-01 | 메인 화면 | "오늘 N명이 확인했어요" 메시지, 가족 방문 예정 알림 |
| E-02 | 가족 메시지 | 가족이 보낸 메시지 목록 (큰 글씨) |
| E-03 | 답장 화면 | 간단한 답장 입력 (텍스트 or 버튼 선택형) |
| E-04 | 데이터 공개 설정 | 공유할 건강 데이터 항목 및 공개 대상 선택 |

### Wear OS 앱 (어르신 워치)

| 화면 ID | 화면명 | 설명 |
|---------|--------|------|
| W-01 | 상태 요약 | 현재 심박, 활동 상태 간단 표시 |
| W-02 | 가족 확인 알림 | "아들이 확인했어요" 워치 알림 |

---

## 5. 사용자 흐름

### 보호자 — 이상 알림 대응 흐름

1. 어르신 워치에서 이상 감지 (활동 없음 2시간 / 심박 이상)
2. 백엔드 이상 감지 엔진이 판단
3. 가족 그룹 전원에게 FCM 푸시 알림 발송
4. 보호자가 알림 탭 → `G-07 알림 상세` 진입
5. "채팅방으로 이동" 버튼 → `G-04 가족 채팅방` 진입
6. 가족 중 한 명이 채팅에서 "내가 전화해볼게" 입력
7. 통화 후 결과 채팅 공유 ("주무시고 계셨대요")
8. 알림 상태가 '대응 완료'로 업데이트

### 보호자 — 역할 분담 흐름

1. 매주 월요일 앱이 자동으로 가족 역할 분담 제안 생성
2. 각 보호자에게 역할 제안 푸시 알림 발송
3. 보호자가 `G-05 역할 분담 화면` 진입
4. 본인 일정 수락 / 변경 요청 처리
5. 전원 수락 시 확정, 미수락 시 리마인드 알림

### 어르신 — 가족 연결 확인 흐름

1. 어르신이 `E-01 메인 화면` 진입
2. "오늘 아들·딸·손자 3명이 확인했어요" 표시 확인
3. 가족 메시지 탭 → `E-02 가족 메시지` 진입
4. 딸의 "내일 방문할게요" 메시지 확인
5. `E-03 답장 화면`에서 간단 답장 전송

---

## 6. 관리자 흐름 (향후 B2G 확장 시)

1. 지자체 담당자 웹 대시보드 로그인
2. 담당 구역 어르신 목록 조회 (이상 감지 상태 필터링)
3. 이상 감지 어르신 선택 → 상세 건강 데이터 조회
4. 담당 복지사에게 방문 요청 발송
5. 방문 완료 처리 및 케이스 노트 기록
6. 월간 통계 리포트 출력 (고독사 예방 지표)

---

## 7. 주요 데이터 엔티티

### User (사용자)

| 필드 | 타입 | 설명 |
|------|------|------|
| userId | String (UUID) | 고유 식별자 |
| name | String | 이름 |
| role | Enum (ELDER / GUARDIAN) | 사용자 유형 |
| fcmToken | String | 푸시 알림 토큰 |
| createdAt | DateTime | 가입일 |

### FamilyGroup (가족 그룹)

| 필드 | 타입 | 설명 |
|------|------|------|
| groupId | String (UUID) | 그룹 식별자 |
| elderId | String | 연결된 어르신 ID |
| members | List\<userId\> | 보호자 구성원 목록 |
| createdAt | DateTime | 그룹 생성일 |

### HealthData (건강 데이터)

| 필드 | 타입 | 설명 |
|------|------|------|
| dataId | String (UUID) | 데이터 식별자 |
| elderId | String | 어르신 ID |
| heartRate | Int | 심박수 (bpm) |
| stepCount | Int | 걸음 수 |
| sleepDuration | Int | 수면 시간 (분) |
| activityStatus | Enum (ACTIVE / IDLE / SLEEPING) | 활동 상태 |
| recordedAt | DateTime | 측정 시각 |

### Alert (이상 알림)

| 필드 | 타입 | 설명 |
|------|------|------|
| alertId | String (UUID) | 알림 식별자 |
| groupId | String | 대상 가족 그룹 ID |
| elderId | String | 어르신 ID |
| alertType | Enum (NO_ACTIVITY / HEART_RATE / SLEEP) | 이상 유형 |
| status | Enum (PENDING / RESOLVED) | 대응 상태 |
| triggeredAt | DateTime | 감지 시각 |
| resolvedAt | DateTime? | 해결 시각 |

### ChatMessage (채팅 메시지)

| 필드 | 타입 | 설명 |
|------|------|------|
| messageId | String (UUID) | 메시지 식별자 |
| groupId | String | 채팅방 (= 가족 그룹) ID |
| senderId | String | 발신자 userId |
| content | String | 메시지 내용 |
| linkedAlertId | String? | 연결된 알림 ID (알림 트리거 채팅 시) |
| sentAt | DateTime | 전송 시각 |

### CareSchedule (역할 분담)

| 필드 | 타입 | 설명 |
|------|------|------|
| scheduleId | String (UUID) | 일정 식별자 |
| groupId | String | 가족 그룹 ID |
| weekStartDate | Date | 해당 주 시작일 |
| assignments | Map\<userId, List\<Date\>\> | 보호자별 담당일 |
| status | Enum (PROPOSED / CONFIRMED) | 확정 여부 |

---

## 8. 엔티티 간 관계 요약

```
User (ELDER) ──── 1 ──── FamilyGroup ──── N ──── User (GUARDIAN)
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
         HealthData          Alert          CareSchedule
              │                │
              │         (linkedAlertId)
              │                ▼
              └──────────> ChatMessage
```

- **FamilyGroup**이 핵심 허브 — 어르신 1명 : 그룹 1개 : 보호자 N명
- **Alert**는 HealthData의 이상 감지 결과로 생성
- **ChatMessage**는 Alert와 선택적으로 연결 (알림 트리거 채팅)
- **CareSchedule**은 FamilyGroup 단위로 주간 생성

---

## 9. 프로젝트 폴더 구조 예시

```
FamilyCare/
├── app/                          # 보호자용 Android 앱
│   └── src/main/
│       ├── java/com/familycare/
│       │   ├── ui/
│       │   │   ├── dashboard/    # G-01 가족 대시보드
│       │   │   ├── health/       # G-02 건강 데이터 상세
│       │   │   ├── alert/        # G-03, G-07 알림 화면
│       │   │   ├── chat/         # G-04 채팅방
│       │   │   ├── schedule/     # G-05 역할 분담
│       │   │   └── settings/     # G-06 설정
│       │   ├── data/
│       │   │   ├── api/          # Retrofit API 인터페이스
│       │   │   ├── repository/   # Repository 패턴
│       │   │   └── model/        # 데이터 모델 (DTO)
│       │   ├── domain/
│       │   │   ├── usecase/      # 비즈니스 로직
│       │   │   └── model/        # 도메인 모델
│       │   └── di/               # Hilt DI 모듈
│       └── res/
│           ├── layout/
│           └── values/
│
├── elder-app/                    # 어르신용 Android 앱
│   └── src/main/
│       └── java/com/familycare/elder/
│           ├── ui/
│           │   ├── main/         # E-01 메인 화면
│           │   ├── message/      # E-02, E-03 메시지/답장
│           │   └── settings/     # E-04 공개 범위 설정
│           └── data/
│
├── wear-app/                     # Wear OS 앱 (어르신 워치)
│   └── src/main/
│       └── java/com/familycare/wear/
│           ├── ui/               # W-01, W-02 워치 화면
│           ├── health/           # Samsung Health 연동
│           └── sync/             # 백엔드 데이터 전송
│
├── backend/                      # 백엔드 서버 (미정 — 예시: Spring Boot)
│   └── src/main/
│       ├── controller/           # REST API 엔드포인트
│       ├── service/
│       │   ├── HealthService     # 건강 데이터 처리
│       │   ├── AlertService      # 이상 감지 로직
│       │   ├── ChatService       # 채팅 처리
│       │   └── ScheduleService   # 역할 분담 생성
│       ├── repository/           # DB 접근
│       ├── model/                # Entity 모델
│       └── config/               # FCM, WebSocket 설정
│
└── docs/                         # 문서
    ├── structure.md              # 이 문서
    ├── api-spec.md               # API 명세
    └── wireframe/                # 화면 와이어프레임
```

---

## 10. 주요 컴포넌트 / 모듈 구조

### 보호자 앱 — 주요 모듈

| 모듈 | 역할 | 연결 화면 |
|------|------|-----------|
| `HealthDashboardViewModel` | 어르신 건강 데이터 조회 및 상태 관리 | G-01, G-02 |
| `AlertViewModel` | 이상 알림 목록 및 상태 업데이트 | G-03, G-07 |
| `ChatViewModel` | 채팅 메시지 송수신, WebSocket 연결 | G-04 |
| `ScheduleViewModel` | 역할 분담 제안 수신 및 수락 처리 | G-05 |
| `FCMService` | 백그라운드 푸시 알림 수신 및 라우팅 | 전체 |
| `HealthRepository` | API 호출 및 로컬 캐싱 | 데이터 레이어 |

### Wear OS 앱 — 주요 모듈

| 모듈 | 역할 |
|------|------|
| `SamsungHealthConnector` | Samsung Health API 연동, 데이터 수집 |
| `DataSyncWorker` | 주기적 백엔드 데이터 전송 (WorkManager) |
| `WearNotificationReceiver` | 가족 확인 알림 수신 및 워치 표시 |

### 백엔드 — 주요 모듈

| 모듈 | 역할 |
|------|------|
| `AlertDetectionEngine` | 이상 감지 규칙 처리 (활동 없음 임계값, 심박 범위) |
| `FCMPushService` | 그룹 전체 알림 발송 |
| `WebSocketChatHandler` | 실시간 채팅 메시지 처리 |
| `ScheduleGenerator` | 주간 역할 분담 자동 생성 로직 |

---

## 11. 프론트와 백 간 연결 포인트

| 연결 포인트 | 방식 | 엔드포인트 예시 | 설명 |
|------------|------|----------------|------|
| 건강 데이터 전송 (워치 → 서버) | REST POST | `POST /health-data` | Wear OS에서 주기적 전송 |
| 건강 데이터 조회 (앱 → 서버) | REST GET | `GET /groups/{groupId}/health` | 가족 대시보드 데이터 조회 |
| 이상 알림 수신 | FCM Push | — | 서버 → FCM → 보호자 앱 |
| 알림 목록 조회 | REST GET | `GET /groups/{groupId}/alerts` | G-03 알림 목록 |
| 알림 상태 업데이트 | REST PATCH | `PATCH /alerts/{alertId}/resolve` | 대응 완료 처리 |
| 채팅 메시지 송수신 | WebSocket | `ws://server/chat/{groupId}` | 실시간 채팅 |
| 역할 분담 조회 | REST GET | `GET /groups/{groupId}/schedule` | G-05 화면 데이터 |
| 역할 분담 수락 | REST PATCH | `PATCH /schedules/{scheduleId}/accept` | 개별 수락 처리 |
| 가족 확인 현황 조회 | REST GET | `GET /elders/{elderId}/check-status` | E-01 어르신 화면 |

> **MVP 단계**: REST API 우선 구현. 채팅은 더미 데이터 또는 Firebase Realtime DB로 대체 가능.

---

## 12. 향후 구조 확장 방향

| 단계 | 기능 | 구조 변경 사항 |
|------|------|--------------|
| **v1.1** | 약 복용 알림 | `MedicationSchedule` 엔티티 추가, 워치 알림 연동 |
| **v1.2** | 로그인 / 인증 | Firebase Auth 또는 JWT 기반 인증 레이어 추가 |
| **v2.0** | B2G 관리자 웹 | 별도 웹 프론트엔드 + `AdminUser` 유형 및 권한 추가 |
| **v2.1** | 건강보험공단 연계 | 외부 API 연동 모듈 (`InsuranceAPIConnector`) 추가 |
| **v2.2** | 다수 어르신 관리 | `FamilyGroup` 1:1 구조 → 1:N 확장, 복지사 역할 추가 |
| **v3.0** | AI 이상 감지 고도화 | 규칙 기반 → ML 모델 (`AlertMLEngine`) 교체 |

---

> **개발 우선순위 요약**
> 1. 더미 데이터 기반 UI 화면 먼저 구현 (G-01, G-04, E-01)
> 2. Samsung Health API 연동 및 건강 데이터 수신
> 3. 이상 감지 알림 → FCM 발송 연결
> 4. 채팅 기능 연결 (알림 → 채팅 트리거)
> 5. 어르신 앱 확인 현황 화면 완성