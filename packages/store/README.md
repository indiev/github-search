# @packages/store

이 패키지는 애플리케이션의 전역 상태 관리를 위한 Redux Store 설정을 포함하고 있습니다.
Redux Toolkit과 RTK Query를 기반으로 구성되어 있습니다.

## 개발 가이드 (Development Guide)

### 1. 새로운 API 추가하기 (RTK Query)

이 프로젝트는 Code Splitting을 위해 `injectEndpoints`를 사용합니다.
모든 API 정의는 `packages/store/src/lib/base/base.api.ts`에 정의된 `baseAPI`를 확장하여 작성해야 합니다.

#### 단계별 가이드:

1. **API 파일 생성**: `src/lib/features` 또는 적절한 위치에 새로운 API 파일을 생성합니다.
2. **endpoints 주입**: `baseAPI.injectEndpoints`를 사용하여 엔드포인트를 정의합니다.
3. **Tags 추가**: `enhanceEndpoints`를 사용하여 캐싱 무효화(invalidation)에 사용할 Tag를 추가합니다.

**예시 코드:**

```typescript
import { baseAPI } from "../../base/base.api";

// 1. Tag 타입 정의
const TAG_TYPE = "Users";

// 2. endpoints 주입 및 Tag 추가
export const userApi = baseAPI
  .enhanceEndpoints({
    addTagTypes: [TAG_TYPE],
  })
  .injectEndpoints({
    endpoints: (builder) => ({
      getUsers: builder.query<User[], void>({
        query: () => "users",
        providesTags: [TAG_TYPE],
      }),
      addUser: builder.mutation<User, Partial<User>>({
        query: (body) => ({
          url: "users",
          method: "POST",
          body,
        }),
        invalidatesTags: [TAG_TYPE],
      }),
    }),
  });

export const { useGetUsersQuery, useAddUserMutation } = userApi;
```

### 2. 새로운 Slice 추가하기 (Redux State)

새로운 전역 상태(State)가 필요한 경우 `createSlice`를 사용하여 Slice를 생성하고 Store에 연결합니다.

#### 단계별 가이드:

1. **Slice 파일 생성**: `src/lib/features` 등 적절한 위치에 Slice 파일을 생성합니다.
2. **Slice 정의**: `createSlice`를 사용하여 reducer와 action을 정의합니다.
3. **Store에 등록**: `src/lib/store.ts`의 `combineSlices`에 생성한 Slice를 추가합니다.

**예시 코드 (Slice 생성):**

```typescript
// src/lib/features/counter/counterSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CounterState {
  value: number;
}

const initialState: CounterState = { value: 0 };

export const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
  },
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;
```

**예시 코드 (Store 등록 - src/lib/store.ts):**

```typescript
// src/lib/store.ts
import { combineSlices, configureStore } from "@reduxjs/toolkit";
import { baseAPI } from "./base/base.api";
import { counterSlice } from "./features/counter/counterSlice";

// combineSlices에 새로운 slice를 추가합니다.
const rootReducer = combineSlices(baseAPI, counterSlice);

// ... 나머지 설정
```

### 참고 자료 (References)

- [Redux Toolkit Usage Guide](https://redux-toolkit.js.org/usage/usage-guide)
- [Redux Toolkit Usage with TypeScript](https://redux-toolkit.js.org/usage/usage-with-typescript)
