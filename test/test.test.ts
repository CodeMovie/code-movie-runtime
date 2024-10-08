import { CodeMovieRuntime } from "../src/lib";

const wait = () => new Promise((r) => setTimeout(r, 0));

beforeAll(() => {
  window.customElements.define("code-movie-runtime", CodeMovieRuntime);
  return window.customElements.whenDefined("code-movie-runtime");
});

afterEach(() => {
  document.querySelectorAll("code-movie-runtime").forEach((el) => el.remove());
});

function $(
  attributes: Record<string, any> = {},
  innerHTML = "",
): CodeMovieRuntime {
  const instance = document.createElement("code-movie-runtime");
  for (const name in attributes) {
    instance.setAttribute(name, attributes[name]);
  }
  if (innerHTML) {
    instance.innerHTML = innerHTML;
  }
  return instance;
}

describe("attributes and properties", () => {
  test("controls", () => {
    const instance = $();
    // defaults
    expect(instance.controls).toBe(false);
    expect(instance.hasAttribute("controls")).toBe(false);
    // setting via setter
    instance.controls = true;
    expect(instance.controls).toBe(true);
    expect(instance.getAttribute("controls")).toBe("controls");
    // setting via setter to falsy garbage REMOVES controls
    instance.controls = null as any;
    expect(instance.controls).toBe(false);
    expect(instance.hasAttribute("controls")).toBe(false);
    // setting via setter to truthy garbage ADDS controls
    instance.controls = { foo: 42 } as any;
    expect(instance.controls).toBe(true);
    expect(instance.getAttribute("controls")).toBe("controls");
    // Removal via attributes
    instance.removeAttribute("controls");
    expect(instance.controls).toBe(false);
    expect(instance.hasAttribute("controls")).toBe(false);
    // Addition via attributes
    instance.setAttribute("controls", "whatever");
    expect(instance.controls).toBe(true);
    expect(instance.getAttribute("controls")).toBe("whatever");
  });

  test("keyframes", () => {
    const instance = $();
    // defaults
    expect(instance.keyframes).toEqual([]);
    expect(instance.hasAttribute("keyframes")).toBe(false);
    // setting via setter
    instance.keyframes = [0, 1, 2, 3];
    expect(instance.keyframes).toEqual([0, 1, 2, 3]);
    expect(instance.getAttribute("keyframes")).toBe("0 1 2 3");
    // setting via setter to unordered values
    instance.keyframes = [1, 2, 0, 3];
    expect(instance.keyframes).toEqual([0, 1, 2, 3]);
    expect(instance.getAttribute("keyframes")).toBe("0 1 2 3");
    // setting to non-array values
    instance.keyframes = { foo: 42 } as any;
    expect(instance.keyframes).toEqual([]);
    expect(instance.hasAttribute("keyframes")).toBe(false);
    // setting to an array with negative numbers inside
    instance.keyframes = [0, 1, -2, 3] as any;
    expect(instance.keyframes).toEqual([0, 1, 2, 3]);
    expect(instance.getAttribute("keyframes")).toBe("0 1 2 3");
    // setting to an array with non-numbers inside
    instance.keyframes = [0, 1, "a", 2] as any;
    expect(instance.keyframes).toEqual([0, 1, 2]);
    expect(instance.getAttribute("keyframes")).toBe("0 1 2");
    // setting to an array with numeric non-numbers inside
    instance.keyframes = [0, 1, "3", 2] as any;
    expect(instance.keyframes).toEqual([0, 1, 2, 3]);
    expect(instance.getAttribute("keyframes")).toBe("0 1 2 3");
    // addition via attributes
    instance.setAttribute("keyframes", "0 1   2\n\n3");
    expect(instance.keyframes).toEqual([0, 1, 2, 3]);
    expect(instance.getAttribute("keyframes")).toBe("0 1   2\n\n3");
    // removal via attributes
    instance.removeAttribute("keyframes");
    expect(instance.keyframes).toEqual([]);
    expect(instance.hasAttribute("keyframes")).toBe(false);
  });

  test("current", () => {
    const instance = $({ keyframes: "0 1 2 3" });
    // defaults
    expect(instance.current).toBe(0);
    expect(instance.hasAttribute("current")).toBe(false);
    // setting via setter
    instance.current = 1;
    expect(instance.current).toEqual(1);
    expect(instance.getAttribute("current")).toBe("1");
    // setting to non-number garbage
    instance.current = "hello";
    expect(instance.current).toEqual(0);
    expect(instance.getAttribute("current")).toBe("0");
    // setting to out-of bounds number
    instance.current = 7;
    expect(instance.current).toEqual(3);
    expect(instance.getAttribute("current")).toBe("3");
    // setting to negative number
    instance.current = -1;
    expect(instance.current).toEqual(0);
    expect(instance.getAttribute("current")).toBe("0");
    // set via attributes
    instance.setAttribute("current", "3");
    expect(instance.current).toEqual(3);
    expect(instance.getAttribute("current")).toBe("3");
    // remove attribute
    instance.removeAttribute("current");
    expect(instance.current).toEqual(0);
    expect(instance.hasAttribute("current")).toBe(false);
  });
});

describe("toggle classes", () => {
  test("with go(), next(), prev()", () => {
    const instance = $({ keyframes: "0 1 2 3" }, "<div></div>");
    const child = instance.firstChild as HTMLDivElement;
    instance.go(2);
    expect(child.classList.contains("frame2")).toBe(true);
    instance.go(0);
    expect(child.classList.contains("frame2")).toBe(false);
    expect(child.classList.contains("frame0")).toBe(true);
    instance.next();
    expect(child.classList.contains("frame0")).toBe(false);
    expect(child.classList.contains("frame1")).toBe(true);
    instance.prev();
    expect(child.classList.contains("frame1")).toBe(false);
    expect(child.classList.contains("frame0")).toBe(true);
  });

  test("on slotchange", async () => {
    const instance = $({ keyframes: "0 1 2 3" }, "<div></div>");
    const child = instance.firstChild as HTMLDivElement;
    await wait(); // allow the async slotchange event to fire
    expect(child.classList.contains("frame0")).toBe(true);
  });
});
