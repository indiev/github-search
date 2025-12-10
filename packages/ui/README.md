# `@repo/ui`

`@repo/ui` 는 이 모노레포에서 사용하는 **공용 UI 컴포넌트 라이브러리**입니다.  
MUI(Material UI)의 컴포넌트와 테마를 기반으로 하되, Tailwind CSS 유틸리티 클래스를 함께 사용하여 GitHub 사용자 검색 화면에 특화된 UI를 제공합니다.

## 패키지 구조

- `src/global.css`
  - MUI 테마가 가진 색상·타이포그래피·breakpoint 정보를 CSS 변수로 노출하고, Tailwind 4와 연결하는 글로벌 스타일 파일입니다.
  - `@repo/ui/global.css` 를 앱 레벨에서 import 하면 MUI 테마와 Tailwind 유틸리티가 동일한 디자인 토큰을 공유할 수 있습니다.

- `src/primitives/*`
  - `Button`, `TextField`, `Select`, `Chip`, `Avatar`, `Box`, `Card`, `Typography` 등 MUI 컴포넌트를 thin wrapper 형태로 감싼 기본 빌딩 블록입니다.
  - 공통 스타일링 규칙과 타입 정의를 한 번에 관리하기 위한 레이어로, 상위 도메인 컴포넌트(`UserCard`, 필터 UI 등)는 항상 이 primitives 를 통해 MUI에 접근합니다.

- `src/layouts/*`
  - `AppShell`, `SidebarLayout`, `PageHeader` 등 페이지 전체 레이아웃/구조를 담당하는 컴포넌트입니다.
  - 검색 화면의 “좌측 필터 패널 + 우측 결과 리스트” 구성을 제공하는 `SidebarLayout` 이 여기에 포함됩니다.

- `src/components/*`
  - GitHub 사용자 검색 도메인에 가까운, 재사용 가능한 UI 조각들입니다.
  - 주요 예시:
    - `UserCard`: 단일 GitHub 사용자 카드
    - `UserCardSkeleton`: 로딩 상태 스켈레톤
    - `FilterSection`, `FilterSummaryChips`, `NumberRangeFilter`, `DateRangeFilter`
    - `InfiniteScrollContainer`: 무한 스크롤 레이아웃
    - `ModeSwitch`: 시스템/라이트/다크 테마 토글
    - `AvatarCanvas`: 아바타 이미지를 HTML5 Canvas + WebAssembly 로 렌더링하는 컴포넌트 (아래 상세 설명)

## `AvatarCanvas` 컴포넌트 (Canvas + WebAssembly)

`src/components/AvatarCanvas.tsx` 는 GitHub 사용자 아바타를 `<img>` 대신 **Canvas와 WebAssembly**를 이용해 렌더링하는 클라이언트 컴포넌트입니다.

- 사용 예

```tsx
import AvatarCanvas from "@repo/ui/components/AvatarCanvas";

<AvatarCanvas
  src={user.avatarUrl}
  alt={user.login}
  size={48}
  fallbackText={user.login}
/>
```

- 주요 동작
  - `use client` 컴포넌트로, 브라우저에서만 동작합니다.
  - `useEffect` 내부에서만 브라우저 전용 API(`Image`, `HTMLCanvasElement`, `getContext`, `getImageData` 등)를 사용하여 SSR 환경에서도 안전합니다.
  - 절차:
    1. `Image` 객체로 `src` 이미지를 로드합니다.
    2. 아바타를 정사각형으로 crop 한 뒤, `<canvas>`에 그립니다.
    3. `getImageData` 로 RGBA 픽셀 배열을 읽습니다.
    4. `@repo/avatar-wasm` 의 `getAvatarWasm()` 을 통해 WebAssembly 모듈을 동적으로 로드하고, `adjust_channel` 함수를 가져옵니다.
    5. 각 픽셀의 R/G/B 채널을 `adjust_channel` 로 한 번씩 통과시켜 톤을 조정한 후, `putImageData` 로 다시 Canvas 에 반영합니다.
    6. WASM 호출이 성공하면 Canvas 를 보여 주고, 실패하면 fallback 으로 되돌립니다.
  - 오류/폴백 처리:
    - 이미지 로드 실패, Canvas 컨텍스트 생성 실패, WebAssembly 초기화/호출 실패 시에는 `hasRendered` 상태를 false 로 두고, 내부에서 사용 중인 MUI `Avatar` 컴포넌트의 텍스트 슬롯에 `fallbackText` 의 첫 글자를 보여 줍니다.
    - 즉, 상위 컴포넌트에서는 `<AvatarCanvas>`만 사용하면 되고, 에러 시에는 자연스럽게 텍스트 아바타로 폴백됩니다.

- 테스트
  - `src/components/AvatarCanvas.cy.tsx` 에 Cypress Component Test가 포함되어 있으며, 다음을 검증합니다.
    - Canvas 및 WASM 처리 성공 시 Canvas 가 보이고 fallback 텍스트는 숨겨지는지
    - `src` 미제공/실패 시 Canvas 를 숨기고 fallback 텍스트를 노출하는지
    - `size` prop 변화에 따라 Avatar와 Canvas의 width/height가 일관되게 유지되는지
    - 컴포넌트 unmount 시 이미지 로딩과 비동기 WASM 작업이 정리(cleanup)되어 메모리 누수/React 경고가 발생하지 않는지

## 테스트와 개발 흐름

- Jest (단위 테스트)
  - `src/__tests__` 및 `src/components/__tests__` 아래에 primitives, 필터/정렬 컴포넌트 등에 대한 단위 테스트가 있습니다.
  - 실행: 패키지 루트에서 `pnpm test` (또는 터보를 통해 루트에서 일괄 실행)

- Cypress (컴포넌트 테스트)
  - `src/components/*.cy.tsx` 에 개별 UI 컴포넌트의 상호작용/스타일을 검증하는 테스트가 있습니다.
  - 실행: `pnpm test:component`

앱(`apps/web`)에서는 이 패키지의 레이아웃, primitives, 도메인 컴포넌트를 조합해 GitHub 사용자 검색 화면을 구성하며, 아바타 렌더링은 항상 `AvatarCanvas` → `@repo/avatar-wasm` → Canvas 픽셀 처리 플로우를 통해 이루어집니다.

