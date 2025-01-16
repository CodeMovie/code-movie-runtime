import { expect } from "@esm-bundle/chai";
import { spy } from "sinon";
import { CodeMovieRuntime } from "../src/lib";
const test = it;

const wait = () => new Promise((r) => setTimeout(r, 0));

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

describe("<code-movie-runtime>", () => {
  before(() => {
    if (window.customElements.get("code-movie-runtime")) {
      return;
    }
    window.customElements.define("code-movie-runtime", CodeMovieRuntime);
    return window.customElements.whenDefined("code-movie-runtime");
  });

  afterEach(() => {
    document
      .querySelectorAll("code-movie-runtime")
      .forEach((el) => el.remove());
  });

  describe("attributes and properties", () => {
    test("controls", () => {
      const instance = $();
      // defaults
      expect(instance.controls).to.equal(false);
      expect(instance.hasAttribute("controls")).to.equal(false);
      // setting via setter
      instance.controls = true;
      expect(instance.controls).to.equal(true);
      expect(instance.getAttribute("controls")).to.equal("controls");
      // setting via setter to falsy garbage REMOVES controls
      instance.controls = null as any;
      expect(instance.controls).to.equal(false);
      expect(instance.hasAttribute("controls")).to.equal(false);
      // setting via setter to truthy garbage ADDS controls
      instance.controls = { foo: 42 } as any;
      expect(instance.controls).to.equal(true);
      expect(instance.getAttribute("controls")).to.equal("controls");
      // Removal via attributes
      instance.removeAttribute("controls");
      expect(instance.controls).to.equal(false);
      expect(instance.hasAttribute("controls")).to.equal(false);
      // Addition via attributes
      instance.setAttribute("controls", "whatever");
      expect(instance.controls).to.equal(true);
      expect(instance.getAttribute("controls")).to.equal("whatever");
    });

    test("keyframes", () => {
      const instance = $();
      // defaults
      expect(instance.keyframes).to.eql([]);
      expect(instance.hasAttribute("keyframes")).to.equal(false);
      // setting via setter
      instance.keyframes = [0, 1, 2, 3];
      expect(instance.keyframes).to.eql([0, 1, 2, 3]);
      expect(instance.getAttribute("keyframes")).to.equal("0 1 2 3");
      // setting via setter to unordered values
      instance.keyframes = [1, 2, 0, 3];
      expect(instance.keyframes).to.eql([0, 1, 2, 3]);
      expect(instance.getAttribute("keyframes")).to.equal("0 1 2 3");
      // setting to non-array values
      instance.keyframes = { foo: 42 } as any;
      expect(instance.keyframes).to.eql([]);
      expect(instance.hasAttribute("keyframes")).to.equal(false);
      // setting to an array with negative numbers inside
      instance.keyframes = [0, 1, -2, 3] as any;
      expect(instance.keyframes).to.eql([0, 1, 2, 3]);
      expect(instance.getAttribute("keyframes")).to.equal("0 1 2 3");
      // setting to an array with non-numbers inside
      instance.keyframes = [0, 1, "a", 2] as any;
      expect(instance.keyframes).to.eql([0, 1, 2]);
      expect(instance.getAttribute("keyframes")).to.equal("0 1 2");
      // setting to an array with numeric non-numbers inside
      instance.keyframes = [0, 1, "3", 2] as any;
      expect(instance.keyframes).to.eql([0, 1, 2, 3]);
      expect(instance.getAttribute("keyframes")).to.equal("0 1 2 3");
      // addition via attributes
      instance.setAttribute("keyframes", "0 1   2\n\n3");
      expect(instance.keyframes).to.eql([0, 1, 2, 3]);
      expect(instance.getAttribute("keyframes")).to.equal("0 1   2\n\n3");
      // removal via attributes
      instance.removeAttribute("keyframes");
      expect(instance.keyframes).to.eql([]);
      expect(instance.hasAttribute("keyframes")).to.equal(false);
    });

    test("current", () => {
      const instance = $({ keyframes: "0 1 2 3" });
      // defaults
      expect(instance.current).to.equal(0);
      expect(instance.hasAttribute("current")).to.equal(false);
      // setting via setter
      instance.current = 1;
      expect(instance.current).to.equal(1);
      expect(instance.getAttribute("current")).to.equal("1");
      // setting to non-number garbage
      instance.current = "hello";
      expect(instance.current).to.equal(0);
      expect(instance.getAttribute("current")).to.equal("0");
      // setting to out-of bounds number
      instance.current = 7;
      expect(instance.current).to.equal(3);
      expect(instance.getAttribute("current")).to.equal("3");
      // setting to negative number
      instance.current = -1;
      expect(instance.current).to.equal(0);
      expect(instance.getAttribute("current")).to.equal("0");
      // set via attributes
      instance.setAttribute("current", "3");
      expect(instance.current).to.equal(3);
      expect(instance.getAttribute("current")).to.equal("3");
      // remove attribute
      instance.removeAttribute("current");
      expect(instance.current).to.equal(0);
      expect(instance.hasAttribute("current")).to.equal(false);
    });
  });

  describe("toggle classes", () => {
    test("with go(), next(), prev()", () => {
      const instance = $({ keyframes: "0 1 2 3" }, "<div></div>");
      const child = instance.firstChild as HTMLDivElement;
      instance.go(2);
      expect(child.classList.contains("frame2")).to.equal(true);
      expect(instance.current).to.equal(2);
      expect(instance.matches(":state(frame2)")).to.equal(true);
      instance.go(0);
      expect(child.classList.contains("frame2")).to.equal(false);
      expect(child.classList.contains("frame0")).to.equal(true);
      expect(instance.current).to.equal(0);
      expect(instance.matches(":state(frame2)")).to.equal(false);
      expect(instance.matches(":state(frame0)")).to.equal(true);
      instance.next();
      expect(child.classList.contains("frame0")).to.equal(false);
      expect(child.classList.contains("frame1")).to.equal(true);
      expect(instance.current).to.equal(1);
      expect(instance.matches(":state(frame0)")).to.equal(false);
      expect(instance.matches(":state(frame1)")).to.equal(true);
      instance.prev();
      expect(child.classList.contains("frame1")).to.equal(false);
      expect(child.classList.contains("frame0")).to.equal(true);
      expect(instance.current).to.equal(0);
      expect(instance.matches(":state(frame1)")).to.equal(false);
      expect(instance.matches(":state(frame0)")).to.equal(true);
      // Wrap around
      instance.prev();
      expect(child.classList.contains("frame0")).to.equal(false);
      expect(child.classList.contains("frame3")).to.equal(true);
      expect(instance.current).to.equal(3);
      expect(instance.matches(":state(frame0)")).to.equal(false);
      expect(instance.matches(":state(frame3)")).to.equal(true);
    });

    test("on slotchange", async () => {
      const instance = $({ keyframes: "0 1 2 3" }, "<div></div>");
      const child = instance.firstChild as HTMLDivElement;
      await wait(); // allow the async slotchange event to fire
      expect(child.classList.contains("frame0")).to.equal(true);
    });

    test("events fire", () => {
      const fn = spy();
      const instance = $({ keyframes: "0 1 2 3" }, "<div></div>");
      instance.addEventListener("cm-beforeframechange", () => fn("before"));
      instance.addEventListener("cm-afterframechange", () => fn("after"));
      instance.go(2);
      expect(fn.args[0]).to.eql(["before"]);
      expect(fn.args[1]).to.eql(["after"]);
    });

    test("cm-beforeframechange event cancels change", () => {
      const instance = $({ keyframes: "0 1 2 3" }, "<div></div>");
      const child = instance.firstChild as HTMLDivElement;
      instance.addEventListener("cm-beforeframechange", (evt) =>
        evt.preventDefault(),
      );
      instance.go(2);
      expect(instance.current).to.equal(0);
      expect(child.classList.contains("frame2")).to.equal(false);
    });
  });
});
