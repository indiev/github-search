# Used Prompts

프로젝트 개발 과정에서 사용된 AI 프롬프트 내역입니다.

### [sample]

- **Agent:**
- **Prompt:**
  >

### [1]

- **Agent:** Gemini
- **Prompt:**
  > @[docs/tasks.md] 에 작성한 내용을 정리해주세요.

### [2]

- **Agent:** Geminia
- **Prompt:**
  > 변경 내역을 보고 그 내역에 따라 나누어서 commit 메시지를 작성하여 commit을 진행해주세요. 커밋메시지는 영어로 작성되야합니다.

### [3]

- **Agent:** Gemini
- **Prompt:**
  > https://mui.com/material-ui/all-components/ 참고하여 @requirements.md 요구사항에 필요한 primitive 를 packages/ui/primitives 에 추가하세요. 추가되어 있는 @Button.tsx , @Link.tsx 도 참고하세요.

### [4]

- **Agent:** Gemini
- **Prompt:**
  > `packages/store/README.md`에 Redux Store 개발 가이드를 작성해주세요.
  >
  > 다음 내용을 반드시 포함하여 작성해주세요:
  >
  > 1. **가이드 범위**: 새로운 API 및 Slice를 추가하는 방법
  > 2. **참고 문서**:
  >    - [Redux Toolkit Usage Guide](https://redux-toolkit.js.org/usage/usage-guide)
  >    - [Usage with TypeScript](https://redux-toolkit.js.org/usage/usage-with-typescript)
  > 3. **구현 요구사항**:
  >    - 새로운 API 추가 시 `enhanceEndpoints`를 사용하여 캐싱 Tag를 추가할 것
  >    - `injectEndpoints` 패턴을 사용하여 엔드포인트를 확장하도록 작성할 것

### [5]

- **Agent:** Gemini
- **Prompt:**
  > https://redux.js.org/usage/writing-tests 문서를 참고하여 `packages/store`의 테스트 환경을 개선하고 테스트 코드를 추가해 주세요.
  >
  > - 기존 설정을 바탕으로 `packages/jest-config`나 `packages/store/jest.config.js`를 확장해도 좋습니다.
  > - `packages/store`는 Redux Toolkit Best Practice를 따르므로, 이에 맞는 고품질의 테스트 코드를 작성해 주세요.
  > - 공통 헬퍼 함수는 `packages/testing`에 정의하고, 아직 테스트가 작성되지 않은 영역을 위한 기본 템플릿도 추가해 주세요.
  > - 추가로 MUI와 TailwindCSS를 사용하는 `packages/ui` 모듈의 `packages/ui/src/__tests__/index.test.tsx`에 대한 기본 테스트 코드도 작성해 주세요.

### [6]

- **Agent:** Gemini
- **Prompt:**
  > https://docs.cypress.io/ 및 https://nextjs.org/docs/app/guides/testing/cypress 문서를 참고하여 `packages/cypress-config`의 기본 설정을 구성하고, `apps/web/cypress.config.ts`를 업데이트해 주세요.
  >
  > - `docs/requirements.md`의 요구사항을 반영하여 기본적인 E2E 테스트 코드나 TODO 리스트를 작성해 주세요.

### [7]

- **Agent:** Gemini
- **Prompt:**
  > Jest와 Cypress Component Testing의 역할 분담 및 테스트 중복 최소화를 위한 개발 가이드 문서를 작성해 주세요. (Next.js 16, React 19, Turborepo 환경 기준)
  >
  > **핵심 가이드라인:**
  >
  > 1. **Jest**: 순수 로직, 유틸, 상태 관리(RTK/Zustand), 단순 컴포넌트(DOM/이벤트 위주).
  > 2. **Cypress CT**: 복잡한 상호작용(모달, 드래그 등), 브라우저 API 의존(쿠키, 스토리지), 실제 레이아웃/CSS 검증.
  > 3. **중복 최소화**: 테스트 피라미드 적용(Jest > CT > E2E), 파일 네이밍 규칙(`*.unit.test.ts`, `*.component.cy.tsx`), 동일 버그에 대해 가장 낮은 레벨에서 테스트 추가.

### [8]

- **Agent:** Gemini
- **Prompt:**
  > https://docs.cypress.io/app/component-testing/react/overview, https://docs.cypress.io/app/component-testing/react/examples, https://docs.cypress.io/app/component-testing/react/api 문서를 참고하여 `apps/web`에 **Cypress Component Testing** 환경을 설정해 주세요.
  >
  > - `apps/web`에 필요한 설정과 예제 테스트 코드를 추가하고, 필요시 `packages/cypress-config`를 확장해 주세요.
  > - `docs/TESTING_STRATEGY.md`를 참고하여 Jest와 역할이 겹치지 않도록 구성해 주세요.
  > - `docs/tasks.md` 및 `docs/requirements.md`에 테스트 관련 TODO 항목을 업데이트해 주세요.

### [9]

- **Agent:** ChatGPT
- **Prompt:**
  > GitHub User Search 페이지의 레이아웃과 카드·필터 UI를 데스크탑 우선으로 재설계하고, 헤더/요약 바/상태 피드백/Compact 모드 등 세부 요구사항을 모두 반영해 주세요. `apps/web`에서는 `@repo/ui` 컴포넌트만 사용하며, 새로운 UI 개선사항을 위해 필요하면 `packages/ui`에 primitives와 components를 추가한 뒤 문서와 테스트도 업데이트해 주세요.

### [10]

- **Agent:** ChatGPT
- **Prompt:**
  > Turborepo 환경에서 GitHub User Search UI 화면(필터, 정렬, Mock 결과 리스트, 무한 스크롤, 레이트 리밋 배너 등)을 순수 UI 계층만으로 구현해 주세요. 실데이터/Redux/API 호출은 금지하고 `packages/ui`에 필요한 primitives/컴포넌트를 추가한 뒤 `apps/web/app/github-search/page.tsx`에서 조합하며, 문서/테스트/프롬프트 로그도 갱신해 주세요.

### [11]

- **Agent:** ChatGPT
- **Prompt:**
  > 이미 구현된 GitHub User Search 화면을 데스크탑 대시보드 수준으로 다듬어 주세요. 헤더의 테마/상태 정리, 필터 요약 바·정렬 메타 텍스트·Compact 모드·고급 필터 접기, 로딩/빈 결과/리밋 상태, UserCard 밀도 조정과 언어 칩 제한, 결과 그리드·두 컬럼 레이아웃, 테스트·문서·prompt 로그 업데이트까지 모두 포함해 주세요.

### [12]

- **Agent:** ChatGPT
- **Prompt:**
  > `docs/requirements.md`의 GitHub REST API 요구사항을 기반으로, `apps/web/lib/github.ts`에 GitHub 사용자 검색 래퍼 함수를 구현해 주세요.
  >
  > - GitHub Search Users API(https://docs.github.com/en/rest/search/search?apiVersion=2022-11-28#search-users)를 사용합니다.
  > - `GITHUB_TOKEN` 환경 변수를 이용해 Authorization 헤더를 설정하고, `searchUsers({ q, page, per_page, sort, order })` 형태의 함수 시그니처를 제공합니다.
  > - `x-ratelimit-*` 헤더를 파싱하여 `RateLimit` 정보를 반환 값에 포함하고, 403/429 응답에 대해서는 Retry-After 및 reset 시각을 고려한 지수 백오프 재시도 로직을 작성해 주세요.
  > - 실패 시 `GitHubAPIError` 커스텀 에러 타입을 던지도록 구현해 주세요.
  > - Next.js App Router 서버 컴포넌트에서 재사용할 수 있도록 `searchUsers`는 서버 전용 모듈로 구현해 주세요(`server-only` import 사용).
  >
  > 또한 `apps/web/app/api/github/search/users/route.ts`에서 위 래퍼를 호출하는 GET 핸들러를 작성해 주세요.
  >
  > - 쿼리 스트링(q, page, per_page, sort, order)을 파싱해서 `searchUsers`에 전달하고
  > - 성공 시 `{ users, total_count, rateLimit }` JSON을 반환하며
  > - `GitHubAPIError`에 대해서는 상태 코드와 rate limit 정보를 포함한 에러 응답을 내려 주세요.

### [13]

- **Agent:** ChatGPT
- **Prompt:**
  > GitHub Search API 호출을 RTK Query로 래핑하기 위해 `packages/store`에 공통 베이스 API와 레이트 리밋 상태 관리를 추가해 주세요.
  >
  > - `src/lib/base/base.api.ts`에 `createApi` 기반 `baseAPI`를 정의하고, `baseQuery`는 커스텀 래퍼(`baseQueryWithRateLimit`)를 사용합니다.
  > - `src/lib/base/baseQueryWithRateLimit.ts`에서는 `fetchBaseQuery`로부터 응답/에러를 받아 `rateLimitUpdated`와 `retryScheduled` 액션을 디스패치하여 레이트 리밋 정보를 Redux 스토어에 저장하고, 403/429 + secondary rate limit 상황을 감지해 자동 재시도 시각을 계산해 주세요.
  > - `src/lib/rateLimitSlice.ts`에는 GitHub rate limit 헤더 구조를 반영한 `RateLimitInfo` / `RateLimitState`와 `rateLimitUpdated`, `retryScheduled`, `retryCancelled`, `retryCleared` 리듀서를 정의하고, `selectRateLimit` 셀렉터를 제공합니다.
  > - `src/lib/store.ts`에서는 `combineSlices(baseAPI, rateLimitSlice)`로 루트 리듀서를 구성하고, SSR 대응을 위한 `makeStore` 헬퍼와 미들웨어 설정을 완성해 주세요.
  > - `src/services/githubApi.ts`에는 `/api/github/search/users` 엔드포인트를 호출하는 `searchUsers` query를 정의하고, 훅(`useSearchUsersQuery`, `useLazySearchUsersQuery`)을 export 해 주세요.
  >
  > 마지막으로 위 기능을 검증하는 Jest 테스트(`base.api.test.ts`, `baseQueryWithRateLimit.test.ts`, `store.test.ts`)도 작성해 주세요.

### [14]

- **Agent:** ChatGPT
- **Prompt:**
  > `docs/requirements.md`의 “레이트리밋 초과 시 재시도, 남은 쿼터 노출” 요구사항을 만족시키기 위해, Redux rate limit 상태를 UI와 검색 흐름에 통합해 주세요.
  >
  > - `apps/web/app/components/RateLimitIndicator.tsx`에 현재 검색 리소스의 남은 쿼터/limit를 Chip으로 노출하고, reset 시각을 Tooltip으로 보여주는 컴포넌트를 구현해 주세요(`selectRateLimit` 사용).
  > - `apps/web/app/components/RateLimitBanner.tsx`에는 쿼터 소진/Secondary Rate Limit 상황에서 자동 재시도 카운트다운, “지금 다시 시도”, “자동 재시도 취소” 버튼을 가진 경고 배너를 구현하고, `retryCleared`/`retryCancelled` 액션과 props로 받은 `onManualRetry` 콜백을 연결해 주세요.
  > - `apps/web/app/github-search/InfiniteUserList.tsx`에서는 `useLazySearchUsersQuery`와 `selectRateLimit`을 사용해 무한 스크롤 로딩을 구현하되, `rateLimit.isLimited`가 true인 경우 추가 요청을 막고, `pendingRetryAt`이 갱신되면 해당 시각 이후 자동으로 `loadMore`를 재실행하도록 효과를 추가해 주세요.
  > - `apps/web/app/github-search/SearchRoot.tsx`에서는 SSR에서 전달된 `initialRateLimit`을 `rateLimitUpdated`로 스토어에 반영하고, 헤더에 `RateLimitIndicator`, 본문 상단에 `RateLimitBanner`를 배치해 주세요.
  >
  > 관련 변경 사항에 대해 기본적인 Jest/Cypress 테스트 또는 TODO 주석도 함께 추가해 주세요.

### [15]

- **Agent:** ChatGPT
- **Prompt:**
  > GitHub 사용자 검색 필터를 GitHub Search API의 `q` 쿼리로 변환하는 도메인 로직을 구현해 주세요.
  >
  > - `apps/web/app/github-search/types.ts`에 필터 상태(`FilterState`, `TypeFilterValue`, `SortValue` 등)를 정의하고, 요구사항(1~8번)을 모두 표현할 수 있는 구조로 설계해 주세요.
  > - `apps/web/app/github-search/filterUtils.ts`에는 다음 기능을 포함해 주세요:
  >   - 초기 필터 값을 생성하는 `buildInitialFilterState`/`initialFilterState`.
  >   - 현재 필터에서 요약 칩 목록을 만드는 `buildFilterSummaryEntries`와 숫자 범위/가입일 필터를 보기 좋은 텍스트로 만드는 헬퍼들.
  >   - 메모리 내 `GitHubUser` 배열을 정렬/필터링하는 `filterUsers`, `sortUsers`.
  >   - 필터 상태를 GitHub Search `q` 문자열로 변환하는 `buildSearchQuery` (type, location, language, repositories, followers, joined date preset/커스텀 범위를 모두 지원).
  > - `apps/web/app/github-search/FilterPanel.tsx`에서는 위 필터 상태를 편집할 수 있는 UI를 구현하되, 고급 필터(Repo/Follower/Location/Language/Joined)는 접히는 영역으로, 숫자 범위/날짜/멀티 선택 필드는 `@repo/ui`의 NumberRangeFilter, DateRangeFilter, MultiChipAutocomplete를 사용해 주세요.
  > - `apps/web/app/github-search/SearchContext.tsx`와 `SearchRoot.tsx`는 필터/정렬 상태를 Context로 공유하고, 요약 칩과 정렬 바(SortBar)를 연결해 주세요.
  >
  > `filterUtils` 및 `FilterPanel`에는 최소한의 Jest 테스트를 추가해, 클릭/입력 후 “검색” 버튼을 눌렀을 때 올바른 필터 객체와 쿼리 문자열이 생성되는지 검증해 주세요.

### [16]

- **Agent:** Gemini
- **Prompt:**
  > 시스템 다크 모드, Tailwind 레이아웃, MUI 테마를 일관되게 적용하기 위한 UI 인프라를 구축해 주세요.
  >
  > - `packages/ui/src/theme/createTheme.ts`와 `typography.ts`에서 머터리얼 디자인 컬러 팔레트(Primary Indigo, Secondary Teal 등)와 폰트 폴백(Apple System > Noto Sans KR)을 설정하고, 버튼/카드/TextField에 대한 기본 스타일 오버라이드를 정의해 주세요.
  > - `packages/ui/src/providers/UIProvider.tsx`와 `ThemeProvider.tsx`에서는 MUI v6 `colorSchemes`와 `InitColorSchemeScript`를 사용해 시스템 다크 모드 연동을 설정하고, 글로벌 `CssBaseline`과 Emotion Cache Provider를 감싼 공용 Provider를 만들어 주세요.
  > - `packages/ui/src/components/ModeSwitch.tsx`에는 `useColorScheme` 훅을 사용한 테마 토글( System / Light / Dark ) 컴포넌트를 구현하고, 레이아웃 상단 우측에 배치할 수 있도록 합니다.
  > - `packages/ui/src/layouts/AppShell.tsx`, `PageHeader.tsx`, `SidebarLayout.tsx`를 추가해, SM/MD/LG/XL 브레이크포인트에 대응하는 페이지 레이아웃(헤더, 사이드 필터, 메인 콘텐츠)을 Tailwind 유틸리티 클래스로 구성해 주세요.
  > - 샘플 Button 렌더링 테스트(`packages/ui/src/__tests__/index.test.tsx`)를 통해 UI Provider 및 테마 설정이 정상 동작하는지 확인해 주세요.

### [17]

- **Agent:** ChatGPT
- **Prompt:**
  > `docs/requirements.md`의 테스트 코드 요구사항과 "Mapping to docs/requirements.md" 주석 패턴을 기반으로, GitHub User Search 전체 흐름을 검증하는 Jest/E2E 테스트를 추가해 주세요.
  >
  > - `apps/web/__tests__/github-search/githubApi.test.ts`에는 `apps/web/lib/github.ts`의 `searchUsers` 래퍼에 대한 단위 테스트를 작성하여, 쿼리 파라미터(q, page, per_page, sort, order) 매핑, Authorization 헤더(`GITHUB_TOKEN` 유무), rate limit 헤더 파싱 및 오류 시 `GitHubAPIError` 동작을 검증해 주세요.
  > - `apps/web/__tests__/github-search/page.ssr.test.tsx`에서는 `/app/github-search/page.tsx`가 SSR에서 `searchUsers`를 올바른 기본값/URL 파라미터와 함께 호출하고, 실패 시 `initialRateLimit`을 `SearchRoot` 프롭으로 전달하는지 테스트해 주세요.
  > - `apps/web/__tests__/github-search/InfiniteUserList.test.tsx`에는 무한 스크롤 리스트의 CSR 페이징 로직을 검증하는 테스트를 추가해 주세요: SSR 이후 첫 CSR 페이지는 page=2로 시작하는지, 추가 페이지가 더 이상 없을 때 “모든 결과를 확인했습니다.” 메시지를 노출하는지, 중복 login을 제거하는지, `isFetching`/rate limit 활성화 시 추가 호출을 막는지, 에러 메시지 및 “다시 시도” 버튼, `pendingRetryAt` 기반 자동 재시도(`retryCleared` 디스패치)까지 포함합니다.
  > - `apps/web/__tests__/github-search/filterUtils.test.ts`에서는 `buildSearchQuery`/`sortUsers`/`filterUsers`/`matchesNumberRange`에 대한 케이스를 보강해, 요구사항(1~8번) 전체에 대한 쿼리 문자열/정렬 동작이 예측 가능한지 검증해 주세요(지역/언어/레포/팔로워/가입일 preset 및 custom 범위).
  > - `apps/web/__tests__/components/RateLimitBanner.test.tsx`에서는 rate limit 상태에 따라 배너가 렌더링/비노출 되는 조건, 남은 쿼터/limit/리셋 시각, `pendingRetryAt` 카운트다운, 수동 재시도 버튼 클릭 시 `retryCleared` 디스패치 + 콜백 호출, 자동 재시도 취소 버튼 클릭 시 `retryCancelled` 디스패치를 테스트해 주세요.
  > - `apps/web/__tests__/docs/requirementsCoverage.test.ts` 파일에서는 루트/앱 README를 읽어 dev 서버 실행 방법, Jest 테스트 실행 방법, `docs/requirements.md`/`docs/TESTING_STRATEGY.md` 링크가 문서에 포함되어 있는지를 검사하는 테스트를 작성해 주세요.
  >
  > 가능하면 각 테스트 파일 상단에 `docs/requirements.md` 매핑 주석을 추가하여, 어떤 요구사항을 커버하는지 명시해 주세요.

### [18]

- **Agent:** ChatGPT
- **Prompt:**
  > `docs/requirements.md`의 “사용자 아바타 이미지 처리: HTML5 Canvas + WebAssembly” 요구사항을 만족시키기 위해, 별도 WASM 패키지와 UI 컴포넌트를 구현해 주세요.
  >
  > - 새로운 워크스페이스 패키지 `packages/avatar-wasm`(배포 이름 `@repo/avatar-wasm`)를 추가하고, `src/wasmBinary.ts`에 단일 `adjust_channel(i32) -> i32` 함수를 노출하는 간단한 WebAssembly 바이너리를 `Uint8Array` 상수로 포함해 주세요.
  > - `src/index.ts`에는 `AvatarWasmExports` 인터페이스와 `getAvatarWasm(): Promise<AvatarWasmExports>` 헬퍼를 정의하여, 최초 호출 시 `WebAssembly.instantiate`로 모듈을 로드하고 이후에는 캐시된 인스턴스를 재사용하도록 구현해 주세요(WebAssembly 미지원 환경에서는 명확한 에러를 던집니다).
  > - `packages/ui/src/components/AvatarCanvas.tsx` 컴포넌트를 작성하여, 전달받은 `src` 이미지를 `<canvas>`에 정사각형으로 크롭/렌더링 한 뒤, `getAvatarWasm().then((exports) => exports.adjust_channel(...))`을 이용해 RGB 채널을 후처리하고, 로딩/에러/WASM 실패 시에는 canvas를 숨기고 `fallbackText`의 첫 글자를 MUI `Avatar` 내에 보여 주도록 해 주세요 (`size` 프롭으로 캔버스와 Avatar width/height를 동기화).
  > - `packages/ui/src/components/UserCard.tsx`에서는 기존 아바타 렌더링을 `AvatarCanvas`로 교체하여, `user.avatarUrl`과 `user.login` 값을 전달하도록 수정해 주세요.
  > - `packages/ui/src/components/AvatarCanvas.cy.tsx`에는 Cypress Component Test를 추가해, (1) 이미지/캔버스 컨텍스트/WASM을 스텁하여 성공 시 canvas가 표시되고 fallback 텍스트가 사라지는 경우, (2) `src`가 없거나 로딩/에러가 발생했을 때 canvas가 숨겨지고 fallback 이니셜이 노출되는 경우, (3) `size` 변경 시 Avatar와 canvas의 CSS 크기가 일치하는 경우, (4) 컴포넌트 언마운트 후 늦게 호출되는 `onload`가 메모리 누수 경고를 발생시키지 않는 경우를 검증해 주세요.
  >
  > `packages/ui/tsconfig.json`과 Jest 설정에 `@repo/avatar-wasm` path/module alias를 추가해, UI 테스트에서 WASM 헬퍼를 안전하게 import 할 수 있도록 구성해 주세요.

### [19]

- **Agent:** ChatGPT
- **Prompt:**
  > GitHub 검색 화면의 UX를 개선하기 위해, 필터/정렬 상태를 세션 단위로 유지하고 Cypress Component Test로 검증해 주세요.
  >
  > - `apps/web/app/github-search/SearchContext.tsx`의 `SearchProvider`에서 초기 상태를 구성할 때, SSR에서 전달된 `initialFilters`/`initialSort`가 없으면 `window.sessionStorage`에 저장된 `"github-search:filters"`/`"github-search:sort"` 값을 복원하고, 변경 시마다 동일한 키로 JSON 직렬화하여 저장하도록 구현해 주세요(브라우저 환경 여부 체크 및 `try/catch`로 스토리지 오류 무시).
  > - `apps/web/app/github-search/SearchRoot.tsx`에서는 `SearchProvider`의 컨텍스트를 이용해 필터/정렬 변경 시 요약 칩과 SortBar, `InfiniteUserList` 키를 적절히 갱신하는 기존 동작을 유지하되, 별도의 “필터 적용됨” 토스트 표시를 위한 상태/타이머를 관리합니다.
  > - `apps/web/app/github-search/page.cy.tsx`의 Cypress Component Test에, 필터와 정렬(예: Sponsorable 스위치 + Followers 정렬)을 변경한 뒤 컴포넌트를 언마운트/다시 마운트했을 때, `SearchProvider`가 `sessionStorage`에서 동일한 상태를 복원하여 요약 Chip과 SortBar가 그대로 유지되는지 검증하는 시나리오를 추가해 주세요.
  >
  > 이때 테스트에서는 `cy.viewport`와 `mountPage()` 헬퍼를 활용하고, 재마운트 후 첫 검색 요청(`@searchUsers` intercept)이 발생한 뒤에도 이전 필터/정렬 상태가 유지되는지까지 확인해 주세요.
