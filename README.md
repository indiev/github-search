# GitHub User Search (Turborepo Monorepo)

GitHub REST API의 사용자 검색 API를 기반으로, 다양한 필터/정렬/페이징을 지원하는 GitHub 사용자 검색 화면을 구현한 모노레포입니다.  
Next.js(App Router) + React 19 + Redux Toolkit + MUI + Tailwind CSS + Turborepo 구조로 구성되어 있으며, Jest / Cypress 를 이용한 테스트가 포함되어 있습니다.

> 과제 요구사항: `docs/requirements.md`

---

## 1. 개발 환경 및 필수 요구사항

- Node.js: `>= 18`
- 패키지 매니저: `pnpm` (루트 `package.json` 의 `"packageManager"` 참조)
- 프레임워크/라이브러리
  - Next.js 16 (App Router, TypeScript)
  - React 19
  - Redux Toolkit + RTK Query
  - MUI (Material UI) + Tailwind CSS
  - Jest + React Testing Library
  - Cypress (Component / E2E Testing)
- 프로젝트 관리: Turborepo (모노레포, 캐시/의존성 관리)

### 필수 / 주요 환경 변수(.env)

루트(`./`) 또는 각 앱(`apps/web`)에 `.env` 파일을 두고 아래 값을 설정합니다.  
`turbo.json` 의 `globalEnv` 로 관리되어, 빌드/테스트 시 공유됩니다.

필수는 아니지만, 실제 GitHub API를 사용할 때 강력히 권장되는 값입니다.

```bash
# GitHub REST API 호출 시 서버 라우트에서 사용
GITHUB_TOKEN=ghp_xxx                # GitHub Personal Access Token

# 프론트엔드에서 API 호출 시 Base URL (기본값: "/")
NEXT_PUBLIC_API_BASE_URL=/          # 보통 로컬에서는 기본값 그대로 사용

# 로컬 개발 서버 포트 (Cypress E2E base URL 계산에도 사용)
APP_PORT=3000
PORT=3000

# Cypress 테스트용 Base URL (없으면 APP_PORT/PORT 기반으로 자동 계산)
CYPRESS_BASE_URL=http://127.0.0.1:3000

# GitHub API 호출을 완전히 Mock 하고 싶을 때 (E2E/로컬 부담 최소화용)
MOCK_GITHUB_API=false               # 필요 시 true 로 설정
```

> 최소 실행:
> - 로컬 개발/테스트만 한다면 `.env` 없이도 동작하도록 되어 있으며,
> - 실제 GitHub API 를 사용해 수동 테스트할 경우 `GITHUB_TOKEN` 설정을 권장합니다.

---

## 2. Turborepo 모듈 구조 및 역할

이 레포는 Turborepo 기반의 모노레포입니다. 주요 앱/패키지는 아래와 같습니다.

### 2.1 Apps

- `apps/web`
  - 메인 Next.js Web 애플리케이션
  - `/github-search` 경로에 GitHub 사용자 검색 화면 구현
  - SSR + CSR 경계(첫 페이지 SSR, 이후 CSR 무한 스크롤) 구현
  - 서버 라우트: `app/api/github/search/users/route.ts`
    - GitHub REST API `/search/users` 호출
    - `Authorization: Bearer ${GITHUB_TOKEN}` 헤더를 통해 서버 사이드에서만 GitHub 호출
    - 레이트 리밋 응답(429/403 등) 파싱 및 에러 정보 매핑
  - 다크 모드 및 머터리얼 팔레트, Tailwind 레이아웃 적용

- `apps/e2e`
  - Cypress E2E 테스트 전용 앱
  - `pnpm test:e2e` 시, Next.js 앱(`web`)을 띄운 뒤 E2E 시나리오 실행
  - 대부분의 테스트는 `cy.intercept` 로 `/api/github/search/users` 라우트를 가로채어 GitHub API 실제 호출 없이 동작

### 2.2 Packages (도메인 / UI / Infra 모듈)

- `packages/store` (`@repo/store`)
  - Redux Toolkit / RTK Query 기반 상태 관리 패키지
  - `lib/base/base.api.ts`, `lib/base/baseQueryWithRateLimit.ts`
    - 공통 API 클라이언트 레이어
    - `NEXT_PUBLIC_API_BASE_URL`를 사용하여 클라이언트/서버 공통 base URL 설정
    - GitHub API 응답의 레이트 리밋 정보를 파싱하여 `rateLimitSlice` 에 전달
  - `services/githubApi.ts`
    - GitHub 사용자 검색 도메인 API 정의
    - `searchUsers` 쿼리: 검색 쿼리(q), 페이지/페이지 사이즈, 정렬/정렬 방향 파라미터 매핑
  - 도메인/스토어 레벨 Jest 테스트 포함

- `packages/ui` (`@repo/ui`)
  - MUI + Tailwind 기반 공용 UI 컴포넌트 라이브러리
  - `primitives/*`: Button, TextField, Select, Chip, Switch 등 기본 UI
  - `components/*`:
    - `UserCard`, `UserCardSkeleton` : 검색 결과 카드
    - `FilterSection`, `FilterSummaryChips`, `NumberRangeFilter`, `DateRangeFilter`
    - `ModeSwitch`: 시스템/라이트/다크 테마 전환
    - `InfiniteScrollContainer`: 무한 스크롤 레이아웃
    - `AvatarCanvas`:
      - HTML5 Canvas + WebAssembly 를 사용한 아바타 렌더링/톤 조정
  - `layouts/*`: AppShell, SidebarLayout, PageHeader 등 레이아웃 컴포넌트
  - Jest + Cypress Component Test(`*.cy.tsx`)로 복잡한 UI 상호작용 검증

- `packages/avatar-wasm` (`@repo/avatar-wasm`)
  - WebAssembly 바이너리 및 래퍼(`getAvatarWasm`) 제공
  - 아바타 이미지 채널 톤 조정 등의 간단한 이미지 처리 로직을 WebAssembly 로 수행
  - UI 레이어의 `AvatarCanvas` 등에서 사용

- `packages/cypress-config` (`@repo/cypress-config`)
  - Cypress 공용 설정/헬퍼
  - `DEFAULT_BASE_URL`, `createE2EConfig`, `createComponentConfig` 등
  - `APP_PORT`, `PORT`, `CYPRESS_BASE_URL` 에 따라 base URL 계산

- `packages/eslint-config` (`@repo/eslint-config`)  
  - 공통 ESLint 설정 (Next.js, React, Turborepo, Prettier 연동)

- `packages/jest-config` (`@repo/jest-config`)  
  - 공통 Jest 설정 (Next.js/React/DOM 환경 공유)

- `packages/tailwind-config` (`@repo/tailwind-config`)  
  - Tailwind CSS 공용 설정

- `packages/testing` (`@repo/testing`)
  - React Testing Library 유틸 등 공용 테스트 헬퍼

- `packages/typescript-config` (`@repo/typescript-config`)
  - 공통 `tsconfig` 베이스 설정

### 2.3 Clean Architecture + Modularity 관점

- **Presentation/UI 레이어**
  - `apps/web` (Next.js 페이지/라우트)
  - `packages/ui` (공용 UI 컴포넌트, 레이아웃, 테마)

- **Application/Domain 레이어**
  - `packages/store`
    - 도메인 상태, 검색 쿼리/필터/정렬 로직
    - RTK Query 로 검색 API 선언

- **Infrastructure 레이어**
  - `apps/web/lib/github.ts`
    - GitHub REST API 호출, 레이트 리밋 헤더 파싱, 재시도 로직
    - `GITHUB_TOKEN` 사용 및 `MOCK_GITHUB_API` 플래그 지원
  - `apps/web/app/api/github/search/users/route.ts`
    - 서버 라우트: 클라이언트에서 직접 GitHub를 호출하지 않고, 서버를 통해서만 호출
  - `packages/avatar-wasm`
    - WebAssembly 기반 이미지 처리

각 레이어는 패키지 단위로 분리되어 의존성이 단방향으로 유지되며, Turborepo 의 캐시 및 작업 의존성(`turbo.json`)을 통해 빌드/테스트 효율을 최적화합니다.

---

## 3. 설치 및 실행 방법

### 3.1 의존성 설치

루트에서 한 번만 수행합니다.

```bash
pnpm install
```

### 3.2 로컬 개발 서버 실행 (Next.js App)

```bash
pnpm dev
```

- Turborepo가 각 앱의 `dev` 스크립트를 실행합니다.
- 기본적으로 `apps/web` 이 `http://localhost:3000` 에서 실행됩니다.
- 브라우저에서 아래 경로를 확인할 수 있습니다.
  - 랜딩 페이지: `http://localhost:3000/`
  - GitHub 사용자 검색 화면: `http://localhost:3000/github-search`

> GitHub API 실제 호출을 테스트하려면 `.env` 에 `GITHUB_TOKEN` 을 설정한 뒤 위 명령을 사용합니다.

### 3.3 프로덕션 빌드 / 서버 실행

```bash
# 전체 앱/패키지 빌드
pnpm build

# (옵션) web 앱만 빌드/실행
pnpm build -- --filter=web
pnpm --filter web start
```

---

## 4. 테스트 실행 방법

테스트 전 기본적으로 의존성 설치(`pnpm install`)는 완료되어 있어야 합니다.

### 4.1 전체 테스트 (루트에서 실행)

```bash
# 모든 워크스페이스의 기본 test 스크립트 실행 (Jest 중심)
pnpm test

# Cypress Component Test (web/ui 등에서 정의한 test:component 실행)
pnpm test:component

# E2E 테스트 (apps/e2e)
pnpm test:e2e
```

### 4.2 특정 패키지/앱 단위 테스트

Turborepo의 `--filter` 옵션을 사용합니다.

```bash
# web 앱의 Jest 테스트만
pnpm test -- --filter=web

# UI 컴포넌트 라이브러리의 테스트만
pnpm test -- --filter=@repo/ui

# store 패키지의 도메인/스토어 테스트만
pnpm test -- --filter=@repo/store
```

또는 각 디렉터리에서 직접 실행할 수도 있습니다.

```bash
# web 앱 (Next.js) 단위
cd apps/web
pnpm test          # Jest
pnpm test:component  # Cypress CT

# e2e 앱 단위
cd apps/e2e
pnpm test:e2e      # Next.js 서버 + Cypress E2E
```

### 4.3 Jest vs Cypress 역할 분리 (요약)

자세한 내용: `docs/TESTING_STRATEGY.md`

- Jest (+ RTL)
  - 검색 쿼리/정렬/페이징 로직
  - RTK Query 엔드포인트 및 데이터 매핑
  - Redux slices, hooks, 단순 컴포넌트
- Cypress Component Test
  - 복잡한 UI 상호작용 (필터 패널 + 결과 리스트 + 페이징)
  - 반응형 레이아웃(SM/MD/LG/XL), 다크 모드, 브라우저 API 연동
- Cypress E2E
  - 랜딩 -> 검색 -> 결과 확인까지 전체 플로우
  - 접근성(A11y), 레이트리밋 배너, 무한 스크롤 등 통합 시나리오

---

## 5. GitHub API 및 레이트 리밋 처리

- 실제 GitHub REST API: `https://api.github.com/search/users`
  - 모든 호출은 서버 라우트 `GET /api/github/search/users` 를 통해서만 발생
  - 브라우저에서 직접 GitHub 도메인을 호출하지 않음
- `apps/web/lib/github.ts`
  - GitHub API 응답 헤더(`x-ratelimit-*`)를 파싱하여 `RateLimit` 정보로 변환
  - 레이트 리밋 초과(429/403 등) 시 재시도 간격 계산
  - `GITHUB_TOKEN`이 설정되어 있으면 `Authorization: Bearer` 헤더를 추가
- `packages/store/src/lib/base/baseQueryWithRateLimit.ts`
  - RTK Query 응답에서 레이트 리밋 정보를 추출하여 Redux 상태로 저장
  - 레이트 리밋 에러 발생 시, 다음 재시도까지 남은 시간을 계산하여 `retryScheduled` 액션 디스패치
- UI 상에서는:
  - 레이트 리밋 배너/인디케이터를 통해 남은 쿼터와 대기 시간을 표시하고,
  - 추가 검색 시도를 적절히 제어하도록 설계되어 있습니다.

---

## 6. 레이아웃/테마 요구사항 반영

- **다크 모드**
  - 시스템 테마 연동 + 수동 Light/Dark 전환 지원 (`ModeSwitch` 컴포넌트)
  - Next.js App Router + MUI + Tailwind 조합으로 HTML 루트에 `dark` 클래스 반영

- **반응형 레이아웃 (SM / MD / LG / XL)**
  - Tailwind Utility 클래스(`grid-cols-1`, `md:grid-cols-2`, `xl:grid-cols-3` 등)를 활용한 카드 그리드
  - Cypress CT/E2E 테스트에서 다양한 `cy.viewport(...)` 조합으로 검증

- **MUI 머터리얼 팔레트**
  - `packages/ui/src/theme` 에서 색상/타이포그래피 정의
  - AppShell/PageHeader 등 레이아웃 전반에 적용

- **폰트 폴백**
  - 시스템(애플 기본) 우선, 이후 Noto 계열 폰트 사용

---

## 7. 과제 요구사항과 매핑 (요약)

`docs/requirements.md` 에 명시된 검색/정렬/필터/페이징/다크 모드/테스트 요구사항은 다음과 같이 매핑됩니다.

- 검색 기능
  - 사용자/조직 필터, 이름/계정/메일 검색, 리포지토리/팔로워/언어/위치/생성일/후원 가능 여부 필터
  - UI: `packages/ui` 의 필터 컴포넌트 + `apps/web/app/github-search` 페이지
  - 도메인: `packages/store` 의 검색 쿼리/파라미터 구성 로직

- 정렬 및 페이징
  - `SortBar` 컴포넌트 (기본/팔로워/리포지토리/가입일 + DESC)
  - SSR 첫 페이지 + CSR 무한 스크롤: `InfiniteUserList`, `InfiniteScrollContainer`

- 테스트
  - Jest: 검색 쿼리/정렬/페이징, 데이터 매핑, SSR/CSR 경계 로직 등에 대한 단위 테스트
  - Cypress CT: 주요 UI 컴포넌트/페이지의 상호작용 및 반응형 레이아웃
  - Cypress E2E: `/` -> `/github-search` 플로우, 접근성(a11y), Happy Path 등

과제 채점/리뷰 시, 구현 사항은 위 섹션과 각 디렉터리(`apps/web`, `packages/*`, `apps/e2e`)를 중심으로 확인할 수 있습니다.

---

## 8. 추가 참고 문서

- 요구사항: `docs/requirements.md`
- 구현 체크리스트: `docs/implementation_checklist.md`
- GitHub 사용자 검색 UI 노트: `docs/github-user-search-ui.md`
- 테스트 전략: `docs/TESTING_STRATEGY.md`
- 작업 태스크 목록: `docs/tasks.md`

이 README는 과제 채점자 및 협업 개발자가 로컬 환경에서 곧바로 프로젝트를 실행하고, 테스트를 수행하며, Turborepo 모듈 구조/역할을 이해할 수 있도록 작성되었습니다.
