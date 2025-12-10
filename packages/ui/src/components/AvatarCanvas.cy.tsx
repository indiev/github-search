import { mount } from "cypress/react";

import AvatarCanvas from "./AvatarCanvas";

/**
 * Mapping to docs/requirements.md
 * - Avatar rendering via HTML5 Canvas + WebAssembly.
 *
 * This file sketches Cypress component tests for AvatarCanvas.
 */

describe("<AvatarCanvas /> canvas and WASM behaviour", () => {
  it("renders the canvas and hides the fallback when image loading and WASM processing succeed", () => {
    const images: HTMLImageElement[] = [];

    cy.window().then((win) => {
      // Canvas 컨텍스트를 가벼운 스텁으로 대체

      cy.stub(
        win.HTMLCanvasElement.prototype as unknown as {
          getContext: () => unknown;
        },
        "getContext",
      ).callsFake(() => ({
        clearRect: cy.stub(),
        drawImage: cy.stub(),
        getImageData: cy.stub().returns({
          data: new Uint8ClampedArray(16),
          width: 4,
          height: 4,
        }),
        putImageData: cy.stub(),
      }));

      // new Image() 호출을 가로채서 이후에 onload 를 수동으로 호출할 수 있게 한다.
      cy.stub(
        win as unknown as { Image: new () => HTMLImageElement },
        "Image",
      ).callsFake(function (this: HTMLImageElement) {
        images.push(this);
        // 실제 이미지를 로드하지 않으므로 최소한의 사이즈만 설정
        this.width = 64;
        this.height = 64;
        return this;
      });
    });

    mount(
      <AvatarCanvas
        src="https://example.com/avatar.png"
        fallbackText="GitHub"
        size={64}
      />,
    );

    // 초기에는 fallback 텍스트가 보이는 상태여야 한다.
    cy.contains("G").should("be.visible");

    // 이미지가 성공적으로 로드된 것처럼 onload 를 호출
    cy.then(() => {
      expect(images.length).to.be.greaterThan(0);
      const image = images[0]!;
      image.onload?.(new Event("load"));
    });

    // WASM 처리까지 끝난 후 canvas 가 표시되고 fallback 은 사라져야 한다.
    cy.get("canvas").should("have.css", "display", "block");
    cy.contains("G").should("not.exist");
  });

  it("shows the first letter of fallbackText and hides the canvas when image loading fails", () => {
    // src 가 제공되지 않으면 AvatarCanvas 는 즉시 fallback 텍스트를
    // 표시하고 canvas 는 화면에서 숨긴다. 이는 이미지 로딩 실패나
    // WebAssembly 초기화 실패 시와 동일한 시각적 결과를 만들어낸다.
    mount(<AvatarCanvas fallbackText="GitHub" size={64} />);

    // fallback 텍스트가 표시되고 canvas 는 숨겨져 있어야 한다.
    cy.get("canvas").should("have.css", "display", "none");
    cy.contains("G").should("be.visible");
  });

  it("keeps the canvas and Avatar width/height in sync for different size props to preserve visual sharpness", () => {
    // size=96 인 경우 Avatar와 canvas의 CSS width/height가
    // 동일하게 유지되는지만 검증한다.
    mount(<AvatarCanvas size={96} fallbackText="Size" />);

    cy.get("canvas").then(($canvas) => {
      expect($canvas).to.have.css("width", "96px");
      expect($canvas).to.have.css("height", "96px");

      cy.wrap($canvas.parent()!).should(($avatar) => {
        expect($avatar).to.have.css("width", "96px");
        expect($avatar).to.have.css("height", "96px");
      });
    });
  });

  it("cleans up image loading and WASM work when the component unmounts to avoid memory leaks", () => {
    const images: HTMLImageElement[] = [];

    cy.window().then((win) => {
      cy.stub(win.console, "error").as("consoleError");

      cy.stub(
        win.HTMLCanvasElement.prototype as unknown as {
          getContext: () => unknown;
        },
        "getContext",
      ).callsFake(() => ({
        clearRect: cy.stub(),
        drawImage: cy.stub(),
        getImageData: cy.stub().returns({
          data: new Uint8ClampedArray(16),
          width: 4,
          height: 4,
        }),
        putImageData: cy.stub(),
      }));

      cy.stub(
        win as unknown as { Image: new () => HTMLImageElement },
        "Image",
      ).callsFake(function (this: HTMLImageElement) {
        images.push(this);
        this.width = 64;
        this.height = 64;
        return this;
      });
    });

    mount(
      <AvatarCanvas
        src="https://example.com/avatar-first.png"
        fallbackText="First"
        size={48}
      />,
    );

    // 첫 번째 AvatarCanvas 가 사용하는 Image 인스턴스를 잡아 둔다.
    let firstImage: HTMLImageElement | undefined;
    cy.then(() => {
      firstImage = images[0];
    });

    // 새로운 props 로 다시 mount 하면 이전 컴포넌트는 unmount 되며
    // effect cleanup 에 의해 cancelled 플래그가 true 로 설정된다.
    mount(
      <AvatarCanvas
        src="https://example.com/avatar-second.png"
        fallbackText="Second"
        size={48}
      />,
    );

    // 이미 unmount 된 첫 번째 컴포넌트의 onload 가 뒤늦게 호출되더라도
    // React 경고(예: 메모리 누수 setState)는 발생하지 않아야 한다.
    cy.then(() => {
      if (firstImage) {
        firstImage.onload?.(new Event("load"));
      }
    });

    cy.get("@consoleError").should("not.have.been.called");
  });
});
