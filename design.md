# design.md

> 프로젝트: 독거 어르신 가족 공동 케어 앱  
> 팀: 7팀 (팀장: 정승혁 / 팀원: 구민우, 김형경)  
> 플랫폼: Android (Kotlin) + Wear OS  
> 설계 기준: MVP 범위 (로그인 기능 제외, 더미 데이터 우선)  
> 최종 업데이트: 설계 착수 시점 기준

---

## 1. 설계 개요

### 1-1. 서비스 구조

```
[삼성헬스 SDK / 더미 데이터]
        │ 건강 데이터 전송
        ▼
[백엔드 서버]
  - 이상 감지 판단
  - FCM 알림 발송
  - 채팅 메시지 저장
  - 가족 확인 기록 저장
        │
   ┌────┴────┐
   ▼         ▼
[보호자 앱]  [어르신 앱]
 (가족 전원)  (어르신 1명)
```

### 1-2. 앱 구분

| 앱 | 사용자 | 주요 목적 |
|---|---|---|
| 보호자 앱 | 독거 어르신의 자녀/보호자 | 건강 데이터 조회, 알림 수신, 가족 채팅 |
| 어르신 앱 | 독거 어르신 본인 | "N명이 오늘 확인했어요" 확인, 가족 메시지 열람 |

### 1-3. MVP 제외 범위

- 로그인 / 회원가입 (개발 편의상 하드코딩 또는 고정 사용자 ID 사용)
- 약 복용 알림
- 역할 자동 배정 스케줄러 (UI 시연용 더미로 대체 가능)


## 2. 주요 화면 설계

### 보호자 앱

| 화면 ID | 화면명 | 접근 경로 |
|---|---|---|
| G-01 | 홈 (건강 대시보드) | 앱 진입 시 첫 화면 |
| G-02 | 알림 목록 | 하단 탭 또는 홈 알림 배지 탭 |
| G-03 | 가족 채팅방 | 알림 탭 / 홈 채팅 버튼 |
| G-04 | 어르신 건강 상세 | 대시보드 카드 탭 |
| G-05 | 가족 구성원 목록 | 설정 또는 홈 상단 |

### 어르신 앱

| 화면 ID | 화면명 | 접근 경로 |
|---|---|---|
| E-01 | 홈 (확인 메시지 화면) | 앱 진입 시 첫 화면 |
| E-02 | 가족 메시지 열람 | 홈 하단 버튼 |

---

## 3. 화면별 핵심 UI 요소

### G-01 홈 (건강 대시보드)

**목적:** 가족 전원이 어르신의 오늘 건강 상태를 한눈에 확인

**주요 요소:**
- 상단: 어르신 이름 + 마지막 데이터 수신 시각
- 카드 3종:
  - 활동량 카드 (오늘 걸음 수, 마지막 움직임 시각)
  - 심박 카드 (현재 심박수 bpm, 상태 텍스트: 정상 / 주의 / 이상)
  - 수면 카드 (어젯밤 총 수면 시간)
- 이상 감지 배너: 이상 상태일 경우 상단에 붉은 배너 표시
- 하단 탭: 홈 / 알림 / 채팅 / 설정

**동작:**
- 화면 진입 시 `GET /health/latest` 호출하여 최신 데이터 표시
- 이상 상태 카드는 배경색 변경 (정상: 기본, 주의: 노랑, 이상: 빨강)
- 카드 탭 → G-04 건강 상세 화면 이동

---

### G-02 알림 목록

**목적:** 이상 감지 이벤트 이력 확인

**주요 요소:**
- 알림 리스트 (최신순)
  - 알림 유형 아이콘 (활동 없음 / 심박 이상)
  - 발생 시각
  - 간략 설명 텍스트 ("2시간 이상 움직임 없음 감지")
  - 채팅방 이동 버튼

**동작:**
- 화면 진입 시 `GET /alerts` 호출
- 각 알림 행 탭 → G-03 채팅방 이동 (해당 알림 스레드)
- 읽지 않은 알림은 강조 표시 (볼드 또는 파란 점)

---

### G-03 가족 채팅방

**목적:** 이상 감지 알림을 트리거로 가족 간 상황 공유 및 역할 조율

**주요 요소:**
- 상단: 알림 컨텍스트 배너 ("오후 2시 – 움직임 없음 감지됨")
- 채팅 말풍선 목록 (발신자 이름 + 시각 + 메시지)
- 하단 입력창 + 전송 버튼
- 빠른 답장 버튼 3종 (예: "내가 전화할게" / "확인했어" / "괜찮으신 것 같아")

**동작:**
- 화면 진입 시 `GET /chat/messages?alertId={id}` 호출
- 메시지 전송: `POST /chat/messages`
- 폴링 방식으로 5초마다 신규 메시지 조회 (WebSocket 미구현 시)

---

### G-04 어르신 건강 상세

**목적:** 특정 지표의 시간대별 상세 데이터 확인

**주요 요소:**
- 탭: 활동량 / 심박 / 수면
- 활동량: 시간대별 걸음 수 막대 그래프 (간단한 뷰)
- 심박: 시간대별 bpm 수치 리스트
- 수면: 취침·기상 시각, 총 수면 시간

**동작:**
- 탭 전환 시 `GET /health/history?type={activity|heart_rate|sleep}&date={yyyy-MM-dd}` 호출

---

### E-01 어르신 홈 (확인 메시지 화면)

**목적:** 어르신이 가족에게 관심받고 있다는 안도감을 느끼게 함

**주요 요소:**
- 대형 텍스트: "오늘 아들·딸 2명이 확인했어요 💙"
  - 이름 목록 표시 (확인한 가족 구성원)
- 가족 메시지 미리보기 1건 (가장 최근 메시지)
- 하단 버튼: "메시지 보기"

**동작:**
- 화면 진입 시 `GET /family/check-ins?date=today` 호출
- 확인한 가족 이름을 서버에서 받아 렌더링

---

### E-02 가족 메시지 열람

**목적:** 가족이 보낸 메시지를 어르신이 확인

**주요 요소:**
- 채팅 목록 (읽기 전용, 가족 메시지만 표시)
- 간단 답장 버튼: 이모지 선택 (👍 / ❤️ / 😊)

**동작:**
- `GET /chat/messages?role=elder` 호출 (어르신 전용 필터)
- 이모지 답장: `POST /chat/messages` (type: emoji)

---

## 4. 사용자 인터랙션 흐름

### 시나리오 1: 이상 감지 → 가족 알림 → 채팅 → 어르신 확인

```
[워치/더미 데이터 발생]
        │
        ▼
[서버: 이상 감지 판단]
  조건: 2시간 이상 활동 없음 OR 심박 이상 범위
        │
        ▼
[FCM 알림 → 가족 전원 수신]
  알림 제목: "어머니 상태 확인 필요"
  알림 내용: "오후 2시간 이상 움직임이 감지되지 않았어요"
        │
        ▼
[가족 앱 알림 탭]
  → G-02 알림 목록 또는 G-03 채팅방 직접 이동
        │
        ▼
[가족 채팅방 대화]
  "내가 전화해볼게" → 전화 후 결과 공유 → 상황 종료
        │
        ▼
[어르신 앱 E-01]
  가족 확인 카운트 증가 → "오늘 N명이 확인했어요" 갱신
```

### 시나리오 2: 어르신 메시지 확인

```
[어르신 앱 진입]
        │
        ▼
[E-01 홈 화면]
  "오늘 N명이 확인했어요" 표시
  가족 최근 메시지 1건 미리보기
        │ "메시지 보기" 탭
        ▼
[E-02 메시지 열람]
  가족 메시지 목록 확인
  이모지로 답장
```

---

## 5. 주요 기능 동작 방식

### 5-1. 이상 감지 로직

```
입력: 건강 데이터 (활동량, 심박수)

이상 판단 조건:
  활동 없음: last_activity_time 기준 현재 시각과 120분 이상 차이
  심박 이상: heart_rate < 40 OR heart_rate > 130 (bpm)
  수면 이상: 야간(22:00~06:00) 외 시간에 수면 지속 4시간 이상 (선택)

처리 흐름:
  1. 데이터 수신 → DB 저장
  2. 이상 조건 체크
  3. 이상 감지 시:
     a. alerts 테이블에 이벤트 기록
     b. 해당 가족 그룹의 FCM 토큰 목록 조회
     c. FCM 다중 발송 (Multicast)
  4. 동일 유형 알림 중복 발송 방지:
     최근 30분 이내 동일 alert_type의 미처리 알림이 있으면 신규 발송 생략
```

### 5-2. 가족 확인 카운트

```
보호자가 G-01 대시보드 진입 시:
  1. GET /health/latest 호출
  2. 서버에서 check_ins 테이블에 (user_id, date) 기록
  3. 당일 확인한 가족 수 = SELECT COUNT(*) FROM check_ins WHERE date = today

어르신 앱 E-01:
  GET /family/check-ins → 오늘 확인한 가족 이름 목록 + 카운트 반환
```

### 5-3. FCM 알림 발송

```
발송 주체: 백엔드 서버 (Firebase Admin SDK)
발송 대상: 가족 그룹에 속한 보호자 전원의 FCM 토큰

알림 payload:
{
  "title": "어머니 상태 확인 필요",
  "body": "오후 2시간 이상 움직임이 감지되지 않았어요",
  "data": {
    "alert_id": "123",
    "alert_type": "inactivity",
    "screen": "CHAT"
  }
}

앱 수신 처리:
  - 포그라운드: 인앱 배너 표시
  - 백그라운드/종료: 시스템 알림 표시
  - 알림 탭 시: data.screen 값 기준으로 화면 이동 (CHAT → G-03)
```

---

## 6. API 초안

> Base URL: `https://{서버주소}/api/v1`  
> 인증: MVP 기준 생략 (고정 user_id 헤더로 대체)  
> 공통 헤더: `X-User-Id: {user_id}`, `Content-Type: application/json`

---

### 6-1. 건강 데이터

#### `POST /health/data` — 건강 데이터 수신 (워치 → 서버)

```json
// Request Body
{
  "elder_id": "elder_001",
  "timestamp": "2025-04-10T14:00:00Z",
  "activity": {
    "steps": 1200,
    "last_active_at": "2025-04-10T11:55:00Z"
  },
  "heart_rate": {
    "bpm": 72,
    "measured_at": "2025-04-10T13:58:00Z"
  },
  "sleep": {
    "slept_at": "2025-04-09T23:10:00Z",
    "woke_at": "2025-04-10T06:30:00Z",
    "duration_min": 440
  }
}

// Response 200
{
  "status": "ok",
  "alert_triggered": false
}
```

#### `GET /health/latest` — 최신 건강 데이터 조회 (보호자 앱 대시보드)

```
Query: elder_id={elder_id}

// Response 200
{
  "elder_id": "elder_001",
  "elder_name": "김순자",
  "last_updated": "2025-04-10T14:00:00Z",
  "activity": {
    "steps_today": 1200,
    "last_active_at": "2025-04-10T11:55:00Z",
    "status": "warning"   // normal | warning | danger
  },
  "heart_rate": {
    "bpm": 72,
    "status": "normal"
  },
  "sleep": {
    "duration_min": 440,
    "status": "normal"
  }
}
```

#### `GET /health/history` — 건강 데이터 이력 조회 (상세 화면)

```
Query: elder_id={elder_id}&type={activity|heart_rate|sleep}&date={yyyy-MM-dd}

// Response 200 (heart_rate 예시)
{
  "type": "heart_rate",
  "date": "2025-04-10",
  "records": [
    { "measured_at": "2025-04-10T08:00:00Z", "bpm": 68 },
    { "measured_at": "2025-04-10T10:00:00Z", "bpm": 74 },
    { "measured_at": "2025-04-10T13:58:00Z", "bpm": 72 }
  ]
}
```

---

### 6-2. 알림

#### `GET /alerts` — 이상 감지 알림 목록 조회

```
Query: elder_id={elder_id}&limit=20&offset=0

// Response 200
{
  "alerts": [
    {
      "alert_id": "123",
      "alert_type": "inactivity",   // inactivity | heart_rate_abnormal
      "triggered_at": "2025-04-10T14:02:00Z",
      "description": "2시간 이상 움직임이 감지되지 않았어요",
      "is_read": false,
      "chat_thread_id": "thread_456"
    }
  ],
  "total": 5
}
```

#### `PATCH /alerts/{alert_id}/read` — 알림 읽음 처리

```json
// Request Body: 없음

// Response 200
{ "status": "ok" }
```

---

### 6-3. 채팅

#### `GET /chat/messages` — 채팅 메시지 조회

```
Query: alert_id={alert_id} OR role=elder&limit=30&offset=0

// Response 200
{
  "thread_id": "thread_456",
  "alert_context": "2025-04-10T14:02:00Z – 움직임 없음 감지",
  "messages": [
    {
      "message_id": "msg_001",
      "sender_id": "user_daughter",
      "sender_name": "김민지",
      "content": "내가 전화해볼게",
      "type": "text",      // text | emoji | system
      "sent_at": "2025-04-10T14:05:00Z"
    }
  ]
}
```

#### `POST /chat/messages` — 메시지 전송

```json
// Request Body
{
  "thread_id": "thread_456",
  "content": "주무시고 계셨대요",
  "type": "text"
}

// Response 201
{
  "message_id": "msg_002",
  "sent_at": "2025-04-10T14:12:00Z"
}
```

---

### 6-4. 가족 확인 기록

#### `GET /family/check-ins` — 오늘 확인한 가족 목록

```
Query: elder_id={elder_id}&date={yyyy-MM-dd}

// Response 200
{
  "date": "2025-04-10",
  "check_count": 3,
  "checked_members": [
    { "user_id": "user_son",      "name": "김철수", "checked_at": "2025-04-10T09:10:00Z" },
    { "user_id": "user_daughter", "name": "김민지", "checked_at": "2025-04-10T14:03:00Z" }
  ]
}
```

#### `POST /family/check-ins` — 확인 기록 저장 (대시보드 진입 시 자동 호출)

```json
// Request Body
{
  "elder_id": "elder_001"
}

// Response 201
{ "status": "ok", "checked_at": "2025-04-10T14:03:00Z" }
```

---

### 6-5. FCM 토큰

#### `POST /users/fcm-token` — FCM 토큰 등록/갱신

```json
// Request Body
{
  "user_id": "user_son",
  "fcm_token": "fCm_Token_String_여기"
}

// Response 200
{ "status": "ok" }
```

---

## 7. 데이터베이스 스키마 초안

> MVP 기준 최소 테이블. DB 종류는 확정 전이므로 필드 타입은 범용 표기.

### `elders` — 어르신 정보

| 컬럼 | 타입 | 설명 |
|---|---|---|
| elder_id | VARCHAR PK | 어르신 고유 ID |
| name | VARCHAR | 이름 |
| birth_year | INT | 출생 연도 |
| family_group_id | VARCHAR FK | 소속 가족 그룹 |
| created_at | DATETIME | 등록 일시 |

---

### `users` — 보호자/가족 사용자

| 컬럼 | 타입 | 설명 |
|---|---|---|
| user_id | VARCHAR PK | 사용자 고유 ID |
| name | VARCHAR | 이름 |
| role | ENUM | `guardian` / `elder` |
| family_group_id | VARCHAR FK | 소속 가족 그룹 |
| fcm_token | VARCHAR | FCM 푸시 토큰 |
| created_at | DATETIME | 등록 일시 |

---

### `family_groups` — 가족 그룹

| 컬럼 | 타입 | 설명 |
|---|---|---|
| group_id | VARCHAR PK | 그룹 ID |
| elder_id | VARCHAR FK | 담당 어르신 ID |
| created_at | DATETIME | 생성 일시 |

---

### `health_logs` — 건강 데이터 로그

| 컬럼 | 타입 | 설명 |
|---|---|---|
| log_id | VARCHAR PK | 로그 ID |
| elder_id | VARCHAR FK | 어르신 ID |
| log_type | ENUM | `activity` / `heart_rate` / `sleep` |
| value_json | JSON | 실제 데이터 (bpm, steps 등) |
| measured_at | DATETIME | 측정 시각 |
| created_at | DATETIME | 저장 시각 |

---

### `alerts` — 이상 감지 알림

| 컬럼 | 타입 | 설명 |
|---|---|---|
| alert_id | VARCHAR PK | 알림 ID |
| elder_id | VARCHAR FK | 어르신 ID |
| alert_type | ENUM | `inactivity` / `heart_rate_abnormal` |
| description | VARCHAR | 알림 설명 텍스트 |
| triggered_at | DATETIME | 감지 시각 |
| is_resolved | BOOLEAN | 처리 여부 (기본 false) |

---

### `alert_reads` — 알림 읽음 기록

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | VARCHAR PK | 기록 ID |
| alert_id | VARCHAR FK | 알림 ID |
| user_id | VARCHAR FK | 읽은 사용자 ID |
| read_at | DATETIME | 읽은 시각 |

---

### `chat_messages` — 채팅 메시지

| 컬럼 | 타입 | 설명 |
|---|---|---|
| message_id | VARCHAR PK | 메시지 ID |
| alert_id | VARCHAR FK | 연결된 알림 ID (NULL 허용: 일반 대화) |
| family_group_id | VARCHAR FK | 가족 그룹 ID |
| sender_id | VARCHAR FK | 발신자 user_id |
| content | TEXT | 메시지 내용 |
| type | ENUM | `text` / `emoji` / `system` |
| sent_at | DATETIME | 전송 시각 |

---

### `check_ins` — 가족 확인 기록

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | VARCHAR PK | 기록 ID |
| elder_id | VARCHAR FK | 어르신 ID |
| user_id | VARCHAR FK | 확인한 가족 user_id |
| checked_date | DATE | 확인 날짜 (yyyy-MM-dd) |
| checked_at | DATETIME | 확인 시각 |

> 인덱스 권장: `check_ins(elder_id, checked_date)`, `alerts(elder_id, triggered_at)`, `chat_messages(alert_id, sent_at)`

---

## 8. 입력값 검증 규칙

### 건강 데이터 수신 (`POST /health/data`)

| 필드 | 규칙 |
|---|---|
| elder_id | 필수, DB 존재 확인 |
| timestamp | 필수, ISO 8601 형식, 현재 시각 기준 ±24시간 내 |
| heart_rate.bpm | 숫자, 0 < bpm < 300 (비현실 값 차단) |
| activity.steps | 숫자, 0 이상 |
| sleep.duration_min | 숫자, 0 이상 1440(24시간) 이하 |

### 채팅 메시지 전송 (`POST /chat/messages`)

| 필드 | 규칙 |
|---|---|
| thread_id / alert_id | 필수, DB 존재 확인 |
| content | 필수, 1자 이상, 500자 이하 |
| type | `text` / `emoji` / `system` 중 하나 |

### FCM 토큰 등록 (`POST /users/fcm-token`)

| 필드 | 규칙 |
|---|---|
| user_id | 필수, DB 존재 확인 |
| fcm_token | 필수, 1자 이상 500자 이하 |

---

## 9. 오류 처리 방식

### 공통 오류 응답 형식

```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "elder_id는 필수 항목입니다.",
    "field": "elder_id"
  }
}
```

### 오류 코드 정의

| HTTP 상태 | 코드 | 상황 |
|---|---|---|
| 400 | `INVALID_INPUT` | 필수 필드 누락 또는 형식 오류 |
| 400 | `OUT_OF_RANGE` | 심박수 등 범위 초과 |
| 404 | `NOT_FOUND` | elder_id, alert_id 등 대상 없음 |
| 409 | `DUPLICATE_CHECKIN` | 당일 동일 사용자의 중복 확인 기록 |
| 429 | `ALERT_THROTTLED` | 동일 유형 알림 30분 내 중복 발송 차단 |
| 500 | `INTERNAL_ERROR` | 서버 내부 오류 |

### 클라이언트 오류 처리 지침

- 400, 404: 사용자에게 안내 토스트 메시지 표시 후 재시도 유도
- 429: "잠시 후 다시 시도해주세요" 표시
- 500: "서버 오류가 발생했어요. 잠시 후 다시 시도해주세요" 표시 + 로그 기록
- 네트워크 없음: "인터넷 연결을 확인해주세요" 표시, 마지막 캐시 데이터 표시 유지

---

## 10. 상태 변화 및 알림 처리

### 건강 상태 enum

| 상태값 | 표시 | 조건 |
|---|---|---|
| `normal` | 정상 (초록) | 이상 조건 없음 |
| `warning` | 주의 (노랑) | 활동 없음 60~120분 |
| `danger` | 이상 (빨강) | 활동 없음 120분 초과 OR 심박 이상 |

### 알림 상태 흐름

```
[감지 없음] ─────────────────────────────────────────→ normal 유지

[조건 충족]
    │
    ▼
alerts 테이블 INSERT (is_resolved = false)
    │
    ▼
FCM 전송 (가족 전원)
    │
    ▼
가족 채팅방에서 상황 확인 후 메시지 전송
    │
    ▼
(수동 또는 자동) is_resolved = true
```

### FCM 알림 중복 방지

```
알림 발송 전 체크:
  SELECT COUNT(*) FROM alerts
  WHERE elder_id = ? AND alert_type = ? AND triggered_at > NOW() - 30분
  AND is_resolved = false

결과 > 0 이면 → 발송 생략 (로그만 기록)
결과 = 0 이면 → 정상 발송
```

---

## 11. 보안 고려사항

> MVP 단계이므로 최소 기준만 적용. 로그인 기능은 제외됨.

| 항목 | 적용 방식 |
|---|---|
| 사용자 식별 | 고정 user_id 헤더 (`X-User-Id`) — 실제 서비스에서는 JWT 토큰으로 교체 필요 |
| 건강 데이터 접근 제어 | elder_id 기준으로 family_group_id 일치 여부 확인 후 응답 |
| FCM 토큰 보관 | DB에 평문 저장 (MVP), 실서비스 시 암호화 저장 권장 |
| HTTPS | 모든 API 통신 HTTPS 필수 (배포 환경 기준) |
| 개인정보 | 어르신 건강 데이터는 family_group 외부에 노출 금지. API 응답에 불필요한 개인 식별 정보 포함 금지 |
| 알림 남용 방지 | 30분 내 동일 유형 알림 중복 차단 (Section 10 참고) |

> **향후 실서비스 전환 시 반드시 추가해야 할 항목:**  
> JWT 기반 인증, 데이터 암호화 (at-rest, in-transit), 감사 로그, 개인정보처리방침 구현

---

## 12. 테스트 포인트

### 기능 테스트

| 테스트 항목 | 확인 내용 | 방법 |
|---|---|---|
| 더미 데이터 수신 | `POST /health/data` 호출 시 DB 저장 확인 | Postman 또는 curl |
| 이상 감지 판단 | `last_active_at` 기준 120분 초과 시 `danger` 상태 반환 | 더미 데이터 조작 |
| FCM 알림 발송 | 이상 감지 시 보호자 기기에 알림 수신 확인 | 실기기 2대 테스트 |
| 알림 중복 차단 | 30분 내 동일 알림 재발생 시 FCM 미발송 확인 | 연속 데이터 POST |
| 채팅 메시지 전송 | 메시지 전송 후 DB 저장 및 목록 조회 확인 | Postman + 앱 |
| 가족 확인 카운트 | 대시보드 진입 시 check_ins 기록 및 카운트 증가 | 앱 진입 + GET /family/check-ins |
| 어르신 앱 표시 | 확인 가족 이름 목록 정확히 표시 | 보호자 앱 진입 후 어르신 앱 확인 |

### 경계값 테스트

| 항목 | 경계 조건 |
|---|---|
| 심박수 | bpm = 40 (경계), bpm = 39 (이상), bpm = 130 (경계), bpm = 131 (이상) |
| 활동 없음 | 119분 (정상), 120분 (danger), 121분 (danger) |
| 메시지 길이 | 500자 (정상), 501자 (오류) |
| 수면 시간 | 1440분 (정상), 1441분 (오류) |

### UI 테스트

| 항목 | 확인 내용 |
|---|---|
| 이상 상태 배너 | danger 상태 시 홈 화면 상단 빨간 배너 표시 |
| 알림 미읽음 뱃지 | 읽지 않은 알림 개수 하단 탭 뱃지에 표시 |
| 채팅 폴링 | 5초 간격 신규 메시지 자동 갱신 |
| 빠른 답장 버튼 | 탭 시 content로 전송 후 버튼 비활성화 |
| 어르신 앱 글자 크기 | 주요 텍스트 18sp 이상 확인 |

### 시연 시나리오 완주 테스트

```
체크리스트:
  □ 더미 데이터로 이상 감지 이벤트 발생
  □ 보호자 기기 2대 이상 FCM 알림 동시 수신
  □ 알림 탭 → 채팅방 이동
  □ 채팅 메시지 전송 및 상대방 기기 수신
  □ 어르신 앱에서 "N명 확인" 카운트 정확히 표시
  □ 위 흐름을 실기기에서 3회 연속 오류 없이 완주
```