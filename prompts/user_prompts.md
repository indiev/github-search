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

- **Agent:** Gemini
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
