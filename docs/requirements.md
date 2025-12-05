# GitHub REST API 기반 사용자 검색 구현 과제

### 개요

GitHub REST API 중 사용자 검색 API를 통해, 사용자를 검색하는 화면을 구현합니다.

https://docs.github.com/en/rest/search/search?apiVersion=2022-11-28#search-users

### 구현해야할 검색 기능

1. 사용자 또는 조직만 검색
2. 계정 이름, 성명 또는 메일로 검색
3. 사용자가 소유한 리포지토리 수로 검색
4. 위치별 검색
5. 사용 언어로 검색
6. 개인 계정을 만든 시점별 검색
7. 팔로워 수로 검색
8. 후원 가능 여부를 기준으로 검색

### 구현 조건

- 시스템 연동 다크 모드 지원
- 스크린: SM / MD / LG / XL 지원
- 머터리얼 디자인 칼라 팔레트 지원
- 폰트 폴백: 애플 기본 > Noto
- UI 컴포넌트는 MUI 사용, UI 컴포넌트 레이아웃은 Tailwind CSS 사용
- 정렬 조건: 기본, followers, repositories, joined 지원 + DESC
- 페이징 처리: SSR 로 첫페이지 선 랜더링, 이후 CSR 로 무한 스크롤
- 사용자 아바타 이미지 처리: HTML5 Canvas + WebAssembly 를 통해 랜더링
- Jest 를 통한 유닛 테스트 지원
- Cypress 를 통한 E2E 테스트 지원
- 모든 GitHub 호출은 서버 라우트에서 Authorization: token 사용
- 레이트리밋 초과 시 재시도, 남은 쿼터 노출

### 테스트 실행

- README.md 에 관련 소스를 실행하고 테스트 할 수 있는 방법 제시

### 개발 및 테스트 환경

- Clean Architecture + Modularity
- InteliJ Idea + pnpm + turbo
- ESLint + Prettier
- ES2023 + Next.js + TypeScript (Next.js App Router)
- MUI + Tailwind CSS
- Redux Toolkit
- Cypress + Jest

### 테스트 코드 작성 요구사항

- 필수 테스트 대상
  - 검색 쿼리, 정렬, 페이징 로직
  - 데이터 매핑, 표시 안전성
  - SSR, CSR 경계 로직
- (옵션, 추가점수) 위 내용 외에 추가 테스트 건당 추가 점수를 부여합니다.
