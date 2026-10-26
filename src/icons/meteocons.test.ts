import { describe, expect, it } from "vitest";
import { getMeteoconSvg, uniquifySvgIds } from "./meteocons";

describe("uniquifySvgIds", () => {
  it("suffixes ids and matching url(#) references", () => {
    const svg =
      '<svg><defs><linearGradient id="paint0"><stop/></linearGradient></defs>' +
      '<path fill="url(#paint0)" clip-path="url(#clip0)" id="clip0"/></svg>';
    const out = uniquifySvgIds(svg, "_vk_test");

    expect(out).toContain('id="paint0_vk_test"');
    expect(out).toContain('fill="url(#paint0_vk_test)"');
    expect(out).toContain('clip-path="url(#clip0_vk_test)"');
    expect(out).toContain('id="clip0_vk_test"');
  });
});

describe("getMeteoconSvg", () => {
  it("caches the same markup within a scope so animated icons are not remounted", () => {
    const a = getMeteoconSvg("humidity", "fill", false, "main");
    const b = getMeteoconSvg("humidity", "fill", false, "main");
    expect(a).toBe(b);
    expect(a).toContain('fill="url(#');
  });

  it("isolates paint ids across scopes (card vs modal)", () => {
    const main = getMeteoconSvg("humidity", "fill", false, "main");
    const modal = getMeteoconSvg("humidity", "fill", false, "modal");

    expect(main).not.toBe(modal);

    const idMain = main.match(/id="(humidity__paint0[^"]+)"/)?.[1];
    const idModal = modal.match(/id="(humidity__paint0[^"]+)"/)?.[1];
    expect(idMain).toBeDefined();
    expect(idModal).toBeDefined();
    expect(idMain).not.toBe(idModal);
    expect(main).toContain(`url(#${idMain})`);
    expect(modal).toContain(`url(#${idModal})`);
  });
});
