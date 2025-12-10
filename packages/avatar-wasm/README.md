# `@repo/avatar-wasm`

이 패키지는 아바타 이미지의 픽셀 톤 조정을 위해 사용할 수 있는 **아주 작은 WebAssembly 모듈**을 제공합니다.

## `src/wasmBinary.ts` 모듈

`src/wasmBinary.ts` 는 실제 WebAssembly 바이너리 코드를 자바스크립트 안에 그대로 포함하고, 이를 `AVATAR_WASM_BINARY` 라는 `Uint8Array` 상수로 export 합니다.

이 바이너리는 하나의 함수만을 가진 최소한의 WebAssembly 모듈입니다.

- 내보내는 함수 이름: `adjust_channel`
- 시그니처: `(value: i32) => i32`
- 동작: 입력으로 받은 정수 값에 상수 `32`를 더한 값을 반환합니다.

즉, RGBA 채널 값(0~255 범위의 정수)을 넣으면 내부적으로 그 값을 조금 더 밝게 만들어 돌려주는 **단일 채널 톤 보정 함수**라고 볼 수 있습니다.

실제 WebAssembly 인스턴스 생성과 호출은 `src/index.ts` 에 정의된 `getAvatarWasm` 헬퍼를 통해 이루어집니다.

```ts
import { getAvatarWasm } from "@repo/avatar-wasm";

const { adjust_channel } = await getAvatarWasm();

const original = 128;
const adjusted = adjust_channel(original); // 160 (128 + 32)
```

상위 레이어(예: `AvatarCanvas` 컴포넌트)에서는 이 모듈을 사용해 Canvas 픽셀 데이터의 각 채널을 WebAssembly로 한 번 가공한 뒤 다시 렌더링하는 식으로 아바타 이미지를 처리합니다.
