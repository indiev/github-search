import "@testing-library/jest-dom";
import { jest } from "@jest/globals";

jest.mock("next/font/google", () => ({
  Noto_Sans: () => ({
    style: { fontFamily: "Noto Sans" },
  }),
  Noto_Sans_KR: () => ({
    style: { fontFamily: "Noto Sans KR" },
    variable: "--font-noto-sans-kr",
  }),
}));

if (typeof HTMLCanvasElement !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLCanvasElement.prototype as any).getContext = jest.fn(() => ({
    // 최소한 AvatarCanvas에서 사용하는 메서드만 스텁
    clearRect: jest.fn(),
    drawImage: jest.fn(),
    getImageData: jest.fn(() => ({
      data: new Uint8ClampedArray(0),
      width: 0,
      height: 0,
    })),
    putImageData: jest.fn(),
  }));
}
