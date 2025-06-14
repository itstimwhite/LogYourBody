import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SEOHead } from "./SEOHead";


describe("SEOHead", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
    document.title = "";
  });

  it("updates document title and meta tags", () => {
    render(
      <MemoryRouter initialEntries={["/test"]}>
        <SEOHead
          title="Test Title"
          description="Desc"
          keywords="one,two"
          image="/img.png"
          url="https://example.com/test"
          type="article"
        />
      </MemoryRouter>,
    );

    expect(document.title).toBe("Test Title");
    const desc = document.querySelector("meta[name='description']");
    expect(desc?.getAttribute("content")).toBe("Desc");
    const ogTitle = document.querySelector("meta[property='og:title']");
    expect(ogTitle?.getAttribute("content")).toBe("Test Title");
    const canonical = document.querySelector("link[rel='canonical']");
    expect(canonical?.getAttribute("href")).toBe("https://example.com/test");
  });
});
