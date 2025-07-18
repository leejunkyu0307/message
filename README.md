# 통합 호스텔 메시지 관리 시스템 - Bed24 기반

## 📋 프로젝트 개요

Bed24 API를 활용한 통합 호스텔 메시지 관리 시스템으로, 다다 하우스와 제이가든 명동역 두 호스텔의 예약 관리 및 고객 메시지를 통합 관리할 수 있는 웹 애플리케이션입니다.

## ✨ 주요 기능

### 🔐 보안 토큰 관리
- 암호화된 API 토큰 저장
- 자동 토큰 갱신 기능
- 세션 기반 보안 저장소 활용

### 📊 실시간 데이터 동기화
- Bed24 API를 통한 실시간 예약 데이터 로드
- 메시지 히스토리 자동 동기화
- 5분 간격 자동 새로고침 기능

### 💬 메시지 관리
- 고객별 메시지 히스토리 관리
- 실시간 메시지 전송/수신
- 읽지 않은 메시지 카운트
- 빠른 답변 템플릿 제공

### 🏨 멀티 호스텔 지원
- **다다 하우스** (Property ID: 12345)
- **제이가든 명동역** (Property ID: 12346)
- 호스텔별 필터링 및 통계

### 📈 대시보드 & 분석
- 실시간 통계 (총 메시지, 읽지않음, 체크인, 투숙중)
- 예약 데이터 CSV 내보내기
- 고객 상태별 필터링 (체크인, 체크아웃, 투숙중)

## 📁 파일 구조

```
├── integrated-hostel-management.html  # 메인 애플리케이션
├── api-config.js                     # Bed24 API 매니저 및 보안 설정
├── test-api.html                     # API 테스트 및 디버깅 도구
└── README.md                         # 프로젝트 문서
```

## 🚀 실행 방법

### GitHub Pages (권장)
1. GitHub Pages 활성화: Settings → Pages → Deploy from branch (master)
2. 접속: https://leejunkyu0307.github.io/message/integrated-hostel-management.html

### 로컬 실행
```bash
cd /home/junkyu0307
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000/integrated-hostel-management.html 접속
```

## 🔧 API 설정

### 현재 상태
- **데모 모드**: API 연결 실패 시 샘플 데이터로 동작
- **토큰 설정**: `api-config.js`에 암호화된 토큰 포함
- **CORS 이슈**: 브라우저에서 직접 Bed24 API 호출 시 제한

### 실제 운영을 위한 설정

#### 1. api-config.js 수정
```javascript
// 실제 Bed24 인증 정보로 교체
this.baseURL = 'https://beds24.com/api/v2';
// 토큰 및 인증 정보 업데이트
```

#### 2. 서버사이드 프록시 구축 (CORS 우회)
```javascript
// Node.js Express 예시
app.use('/api/bed24', proxy('https://beds24.com/api/v2', {
  changeOrigin: true,
  pathRewrite: { '^/api/bed24': '' }
}));
```

## 🎯 테스트 방법

### API 테스트 도구 사용
1. `test-api.html` 접속
2. 연결 테스트, 인증 테스트 실행
3. 실시간 로그 모니터링

### 기능 테스트 (데모 모드)
1. ✅ 고객 목록 표시
2. ✅ 호스텔별 필터링
3. ✅ 메시지 전송/수신
4. ✅ 자동 응답 시뮬레이션
5. ✅ 대시보드 통계 표시
6. ✅ 예약 데이터 내보내기

## ⚠️ 알려진 이슈

### CORS 정책 오류
```
Access to fetch at 'https://beds24.com/api/v2/authentication' from origin 'https://leejunkyu0307.github.io' has been blocked by CORS policy
```
**해결책**: 서버사이드 프록시 또는 Bed24 API 설정 변경 필요

### 404 오류
```
/api/bed24/status:1  Failed to load resource: the server responded with a status of 404
```
**해결책**: 백엔드 서버 구축 또는 서버리스 함수 활용

## 🔮 향후 개발 계획

### Phase 1: 서버 환경 구축
- [ ] Node.js/Express 백엔드 서버 구축
- [ ] CORS 프록시 서버 설정
- [ ] 실제 Bed24 API 연동 테스트

### Phase 2: 기능 확장
- [ ] 실시간 알림 시스템
- [ ] 메시지 템플릿 관리
- [ ] 고급 필터링 및 검색
- [ ] 모바일 반응형 최적화

### Phase 3: 보안 강화
- [ ] OAuth 2.0 인증 구현
- [ ] API 토큰 서버사이드 관리
- [ ] 로그 모니터링 시스템
- [ ] 데이터 암호화 강화

## 💻 기술 스택

### Frontend
- **HTML5/CSS3**: 반응형 UI 디자인
- **Vanilla JavaScript**: API 통신 및 DOM 조작
- **Bed24 스타일**: 원본 시스템과 일관된 디자인

### API Integration
- **Bed24 API v2**: 예약 및 메시지 데이터
- **Fetch API**: 비동기 HTTP 통신
- **Token-based Auth**: 보안 인증 방식

### Deployment
- **GitHub Pages**: 정적 웹사이트 호스팅
- **Git**: 버전 관리
- **WSL2**: 개발 환경

## 🤝 기여자

- **주요 개발**: Claude Code (AI Assistant)
- **프로젝트 관리**: leejunkyu0307
- **API 연동**: Bed24 Integration

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 지원

이슈나 문의사항은 GitHub Issues를 통해 제출해주세요.

---

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>