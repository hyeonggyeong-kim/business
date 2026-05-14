# tech.md

> 가족 공동 케어 앱 — 기술 구현 계획서  
> 7팀 | 팀장: 정승혁 | 팀원: 구민우, 김형경

---

## 1. 기술 스택 개요

이 앱은 Android 네이티브(Kotlin) + Wear OS 앱 2종(가족용/어르신용)과 경량 백엔드로 구성된다. MVP 기간 내 팀 3인이 구현 가능한 기술을 중심으로 선택했으며, 무료 또는 저비용 서비스를 우선 적용한다.

| 영역 | 선택 기술 | 선택 이유 | 대안 |
|------|-----------|-----------|------|
| 모바일 앱 | Android (Kotlin) | 팀 숙련도 높음, 노인층 기기 보급률 1위 | Flutter |
| 워치 앱 | Wear OS (Kotlin) | 갤럭시 워치 지원, 삼성헬스 연동 용이 | Tizen |
| 백엔드 | Spring Boot (Java) | 팀 경험 보유, REST API 빠른 개발 | Node.js / Express |
| 데이터베이스 | MySQL (AWS RDS Free Tier) | 구조화 데이터에 적합, 무료 티어 활용 | Supabase (PostgreSQL) |
| 실시간 알림 | Firebase Cloud Messaging | 무료, Android 표준 Push 알림 | 자체 WebSocket |
| 채팅 | Firebase Realtime Database | 무료 티어로 MVP 충분, 실시간 동기화 | WebSocket + DB |
| 배포 | Railway / Render (무료) | Spring Boot JAR 배포 간편 | AWS EC2, Fly.io |
| 외부 API | Samsung Health SDK | 갤럭시 워치 건강 데이터 수집 표준 | Google Fit API |

---

## 2. 프론트엔드 기술

Android 앱은 Kotlin으로 개발하며, 가족(보호자)용 앱과 어르신용 앱 2가지를 별도 구현한다. UI 구성은 Jetpack Compose 또는 XML 레이아웃 중 팀 역량에 맞는 방식을 택한다.

- **가족용 앱**: 건강 데이터 대시보드, 이상 알림 수신, 채팅방
- **어르신용 앱**: '가족이 확인했어요' 화면, 가족 메시지 수신 전용 (버튼 최소화, 큰 글씨 UI)
- **Wear OS 앱**: 삼성헬스 SDK로 심박수·활동량·수면 데이터 수집 후 서버 전송

어르신용 앱은 UI 복잡도를 낮춰 고령자 접근성을 최우선으로 설계한다. 폰트 크기, 버튼 크기, 색상 대비 모두 WCAG 기준 준수를 목표로 한다.

---

## 3. 백엔드 기술

Spring Boot (Java)로 REST API 서버를 구성한다. 주요 기능은 워치 데이터 수신 및 저장, 이상 감지 로직 처리, FCM 알림 발송이다.

- 워치 → 서버: 주기적 헬스 데이터 POST (활동량, 심박수, 수면)
- 서버 → FCM: 임계값 초과 시 가족 전원의 FCM 토큰에 알림 발송
- 채팅: Firebase Realtime Database를 직접 사용하여 서버 부하 최소화

MVP 단계에서 백엔드는 단일 서버로 운영한다. 마이크로서비스나 메시지 큐는 사용하지 않는다.

---

## 4. 데이터베이스

MySQL을 주 데이터베이스로 사용하며, AWS RDS Free Tier(12개월 무료) 또는 Railway/Render의 MySQL 플러그인을 활용한다.

| 테이블 | 주요 컬럼 | 설명 |
|--------|-----------|------|
| users | user_id, name, role, fcm_token | 사용자 정보 및 Push 토큰 |
| families | family_id, elder_user_id | 가족 그룹 단위 |
| family_members | family_id, user_id | 가족 구성원 매핑 |
| health_records | user_id, type, value, recorded_at | 워치 수집 건강 데이터 |
| alerts | alert_id, family_id, type, status, created_at | 이상 감지 알림 이력 |

채팅 메시지는 Firebase Realtime Database에 저장하여 MySQL 부하를 분리한다.

---

## 5. 인증/로그인 방식

MVP 범위에서는 로그인 기능을 제외하고, 앱 최초 실행 시 UUID 기반 디바이스 식별로 사용자를 구분한다. 이는 시연용 프로토타입에 적합한 방식이다. 추후 서비스 확장 시 카카오 소셜 로그인(KakaoSDK)을 1순위로 도입한다.

---

## 6. 파일 업로드 및 저장 방식

MVP 단계에서는 파일 업로드 기능이 필요하지 않다. 건강 데이터는 숫자형 JSON으로 서버에 전송되며, 이미지나 파일 첨부는 이번 학기 구현 범위에 포함되지 않는다. 추후 어르신 사진 공유 등 기능 추가 시 AWS S3 또는 Firebase Storage를 도입한다.

---

## 7. 외부 API 연동 계획

| API / SDK | 연동 목적 | 리스크 | 대응 방안 |
|-----------|-----------|--------|-----------|
| Samsung Health SDK | 갤럭시 워치 심박수·활동량·수면 수집 | 기기별 SDK 버전 차이, 권한 승인 절차 | 더미 데이터로 화면 먼저 구현 후 SDK 연동 |
| Firebase Cloud Messaging | 이상 알림 Push 발송 (가족 전원) | 낮음 (무료, 안정적) | — |
| Firebase Realtime Database | 채팅 메시지 실시간 동기화 | 낮음 | — |

삼성헬스 SDK는 Samsung Developer 계정 등록 및 앱 서명 설정이 필요하다. 연동 완료 전까지는 더미 JSON 데이터로 UI 및 알림 로직을 먼저 개발한다.

---

## 8. 배포 환경

- **모바일 앱**: APK 직접 배포 (내부 테스트 및 발표 시연용, Play Store 등록 불필요)
- **백엔드**: Railway 또는 Render 무료 플랜에 Spring Boot JAR 배포
- **DB**: Railway MySQL 플러그인 또는 AWS RDS Free Tier
- **채팅/알림**: Firebase 프로젝트 (무료 Spark Plan으로 MVP 충분)

팀 내 별도 서버 장비 없이 클라우드 무료 플랜으로 MVP 운영이 가능하다. 발표 당일 시연 환경은 팀원 기기 2~3대를 사용한다.

---

## 9. 개발 도구 및 협업 도구

| 도구 | 용도 |
|------|------|
| Android Studio | Android/Wear OS 앱 개발 IDE |
| IntelliJ IDEA | Spring Boot 백엔드 개발 IDE |
| GitHub | 소스코드 버전 관리 및 PR 리뷰 |
| Notion | 기획 문서, 회의록, 기능 정의 관리 |
| Figma | UI 와이어프레임 및 화면 설계 |
| Postman | 백엔드 REST API 테스트 |
| Firebase Console | FCM 토큰 관리 및 채팅 DB 모니터링 |

---

## 10. 기술 선택 이유

Android Kotlin은 팀 전원이 수업을 통해 경험을 보유하고 있어 러닝커브 없이 즉시 개발 착수가 가능하다. 국내 노인층의 스마트폰 대부분이 Android 기반이며, 갤럭시 워치와의 연동을 위해 Android 환경이 필수적이다. Firebase는 별도 채팅 서버 없이 실시간 채팅과 Push 알림을 무료로 구현할 수 있어 MVP 개발 공수를 크게 줄인다. Spring Boot는 팀 내 Java 사용 경험이 있어 백엔드 API 개발에 가장 적합하다.

---

## 11. 기술적 제약사항

- **삼성헬스 SDK**: Samsung Developer 계정 등록, 앱 서명, 기기별 API 버전 차이로 연동 복잡도 높음 → 더미 데이터로 선행 개발
- **갤럭시 워치 한정**: Wear OS + 삼성헬스 연동은 갤럭시 워치에서만 완전 동작, 다른 워치는 MVP 범위 외
- **실시간 채팅 확장성**: Firebase Realtime DB는 대규모 사용자에 비적합하나 MVP 시연 수준에서는 문제 없음
- **무료 플랜 슬립 모드**: Railway/Render 무료 플랜은 슬립 모드가 있어 첫 요청 지연 발생 가능 → 발표 전 사전 워밍업 필요

---

## 12. 추후 확장 시 고려사항

- 다양한 워치 플랫폼 지원: 애플워치(HealthKit), 핏비트 API 연동
- 소셜 로그인 도입: 카카오 로그인 → 실사용자 온보딩 간소화
- 주간 케어 역할 자동 제안: 일정 API(구글 캘린더 등) 연동
- 공공 API 연동: 건강보험공단 건강검진 데이터, 지자체 복지 시스템
- 관리자 대시보드: 복지사·지자체 담당자용 웹 대시보드 (React + Spring Boot)
- 배포 환경 고도화: AWS EC2 + RDS + CloudFront로 전환 (사용자 증가 시)

---

## 기술 리스크 요약

| 리스크 | 대응 방안 | 우선순위 |
|--------|-----------|----------|
| 삼성헬스 SDK 연동 실패 | 더미 데이터로 전체 UI/알림 로직 먼저 구현, SDK는 후반부 통합 | 높음 |
| Firebase 무료 한도 초과 | 발표 시연 수준에서는 초과 없음, 데이터 최소화 설계 | 낮음 |
| 백엔드 배포 슬립 모드 | 발표 30분 전 사전 요청으로 서버 웜업 | 중간 |
| 팀원 역할 공백 | 기능별 담당자 지정 + 핵심 기능 우선 개발 | 중간 |