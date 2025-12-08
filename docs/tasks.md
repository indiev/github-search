### Phase 1: 개발 환경 및 아키텍처 수립

1. [x] **프로젝트 워크스페이스 구성**: Turborepo, pnpm, Next.js 16+, TypeScript 환경 초기화
2. [x] **개발 컨벤션 설정**: ESLint, Prettier 및 공통 tsconfig 구성
3. [x] **UI 라이브러리 통합**: Tailwind CSS + MUI 연동, 다크모드 및 폰트(Apple System > Noto) 설정
   - 참조: [MUI Tailwind CSS Integration](https://mui.com/material-ui/integrations/tailwindcss/tailwindcss-v4/)
4. [x] **아키텍처 설계**: Clean Architecture 기반 디렉토리 구조 구성
5. [x] **상태 관리 설계**: Redux Toolkit을 활용한 검색 필터 및 결과 상태 관리

### Phase 2: 핵심 검색 기능 및 로직 구현

6. [ ] **검색 API 연동**: GitHub REST API 래퍼 및 Server Route 구현 (Authorization 처리)
7. [ ] **쿼리 빌더 구현**: 다양한 검색 조건(지역, 언어, 팔로워 등)을 Github API 쿼리로 변환하는 로직 작성
8. [ ] **검색 결과 뷰 및 페이징**: SSR 기반 초기 렌더링 및 CSR 무한 스크롤 연동을 위한 데이터 흐름 구성
9. [ ] **유닛 테스트 작성**: Jest 환경 구성 및 쿼리 변환/데이터 매핑 로직 테스트
10. [ ] **컴포넌트 테스트 작성**: Cypress Component Testing 환경 구성 및 주요 UI 컴포넌트(검색 바, 결과 카드) 테스트

### Phase 3: UI 고도화 및 상세 요구사항 반영

11. [ ] **상세 검색 필터 UI**: 요구사항(1~8번) 전체 필터 및 정렬(Sort/Order) 폼 구현
12. [ ] **반응형 레이아웃 적용**: Tailwind CSS Breakpoint(SM/MD/LG/XL)별 UI 최적화
13. [ ] **무한 스크롤 완성**: Intersection Observer 또는 관련 라이브러리를 활용한 추가 로딩 UX 구현
14. [ ] **API 제한 핸들링**: 레이트 리밋 정보 표시 및 초과 시 재시도 메커니즘/안내 UI 구현

### Phase 4: 성능 최적화 및 품질 보증

15. [ ] **아바타 렌더링 최적화**: HTML5 Canvas + WebAssembly 기반 이미지 처리 모듈화
16. [ ] **통합 테스트(E2E)**: Cypress를 활용한 메인 유저 시나리오(검색, 필터링, 스크롤) 검증
17. [ ] **예외 처리 및 UX 개선**: 네트워크 에러, 검색 결과 없음 등 엣지 케이스 대응
18. [ ] **문서화 및 마무리**: README 작성 (프로젝트 실행법, 테스트 가이드, 아키텍처 설명)
