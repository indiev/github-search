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
