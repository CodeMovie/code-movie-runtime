function toFiniteInt(value: unknown): number {
  const asInt = Math.round(Number(value));
  if (Number.isFinite(asInt) && !Number.isNaN(asInt)) {
    return asInt;
  }
  return 0;
}

function toPositiveFiniteInt(value: unknown): number {
  return Math.abs(toFiniteInt(value));
}

function parseKeyframesAttributeValue(value: unknown): number[] {
  if (value) {
    return String(value)
      .split(/\s+/)
      .map(toPositiveFiniteInt)
      .sort((a, b) => a - b);
  }
  return [];
}

export class CodeMovieRuntime extends HTMLElement {
  // The template function must be public to allow users to replace it
  static _template(): Element[] {
    const tmp = document.createElement("div");
    tmp.innerHTML = `<div part="wrapper">
  <slot></slot>
  <div part="controls-wrapper">
    <slot name="controls">
      <div part="controls">
        <button part="controls-prevBtn" data-command="prev">
          <span>&lt;</span>
        </button>
        <button part="controls-nextBtn" data-command="next">
          <span>&gt;</span>
        </button>
      </div>
    </slot>
  </div>
  <div part="aux-wrapper">
    <slot name="aux"></slot>
  </div>
</div>
<style>
[part="wrapper"] { display: grid; }
:host(:not([controls])) slot[name="controls"] { display: none }
[part="controls"] { position: relative; z-index: 1337; }
</style>`;
    return Array.from(tmp.children);
  }

  // Shadow DOM must be open to allow users to mess with its contents
  _shadow = this.attachShadow({ mode: "open" });

  // Controls aux content visibility. This should _not_ be messed with manually.
  #auxStyles = new CSSStyleSheet();

  // ElementInternals must NOT be accessible, the element relies on having
  // control over its custom states
  #internals = this.attachInternals();

  // List of the keyframe indices, sorted in ascending order
  #keyframes: number[] = [];

  // Current index in the array of keyframes. The public getter "current"
  // is derived from #keyframes and #keyframeIdx
  #keyframeIdx = 0;

  // Next index in the array of keyframes. Always null except when the event
  // `cm-beforeframechange` fires.
  #nextKeyframeIdx: null | number = null;

  constructor() {
    super();
    const content = CodeMovieRuntime._template();
    this._shadow.append(...content);
    this._shadow.addEventListener("click", this._handleClick);
    const defaultSlot = this._shadow.querySelector("slot:not([name])");
    if (!defaultSlot) {
      throw new Error("Template does not contain a default slot");
    }
    defaultSlot.addEventListener("slotchange", () => this._goToCurrent());
    this._shadow.adoptedStyleSheets.push(this.#auxStyles);
  }

  // Of the three existing attributes, "controls" does not need to be observed,
  // because its effects are handled by CSS alone.
  static get observedAttributes() {
    return ["keyframes", "current"];
  }

  attributeChangedCallback(name: string, oldValue: unknown, newValue: string) {
    if (oldValue === newValue) {
      return;
    }
    if (name === "keyframes") {
      this.#keyframes = parseKeyframesAttributeValue(newValue);
      this.#updateAuxStyles();
      this._goToCurrent();
    } else if (name === "current") {
      this.#keyframeIdx = this._toKeyframeIdx(newValue);
      this._goToCurrent();
    }
  }

  get controls(): boolean {
    return this.hasAttribute("controls");
  }

  set controls(value) {
    if (value) {
      this.setAttribute("controls", "controls");
    } else {
      this.removeAttribute("controls");
    }
  }

  get keyframes() {
    return this.#keyframes;
  }

  set keyframes(value: any[]) {
    if (Array.isArray(value)) {
      value = Array.from(
        new Set(value.map(toPositiveFiniteInt).sort((a, b) => a - b)),
      );
      this.setAttribute("keyframes", value.join(" "));
      this.#keyframes = value;
    } else {
      this.removeAttribute("keyframes");
      this.#keyframes = [];
    }
    this.#updateAuxStyles();
    this._goToCurrent();
  }

  _toKeyframeIdx(inputValue: unknown): number {
    let value = toFiniteInt(inputValue);
    if (value < 0) {
      value = Math.abs(value) - 1;
    }
    if (value > this.maxFrame) {
      value = this.maxFrame;
    }
    return this.#keyframes.indexOf(value);
  }

  get current(): number {
    return this.#keyframes[this.#keyframeIdx] || 0;
  }

  set current(inputValue: unknown) {
    const newKeyframeIdx = this._toKeyframeIdx(inputValue);
    if (newKeyframeIdx !== -1) {
      this.#keyframeIdx = newKeyframeIdx;
      this.setAttribute("current", String(this.#keyframes[newKeyframeIdx]));
    } else {
      this.#keyframeIdx = 0;
      this.setAttribute("current", "0");
    }
  }

  get nextCurrent(): number | null {
    if (this.#nextKeyframeIdx) {
      return this.#keyframes[this.#keyframeIdx] || null;
    }
    return null;
  }

  get maxFrame(): number {
    return Math.max(...this.keyframes);
  }

  _goToCurrent(): boolean {
    let targetKeyframeIdx = this.#keyframeIdx;
    if (!(targetKeyframeIdx in this.#keyframes)) {
      if (this.#keyframes.length >= 1) {
        if (targetKeyframeIdx < 0) {
          targetKeyframeIdx = this.#keyframes.length - 1;
        } else {
          targetKeyframeIdx = 0;
        }
      } else {
        targetKeyframeIdx = 0;
      }
    }
    this.#nextKeyframeIdx = targetKeyframeIdx;

    const proceed = this.dispatchEvent(
      new Event("cm-beforeframechange", { bubbles: true, cancelable: true }),
    );
    this.#nextKeyframeIdx = null;
    if (!proceed) {
      return false;
    }
    this._setClassesAndStates(this.#keyframes[targetKeyframeIdx]);
    if (targetKeyframeIdx !== this.#keyframeIdx) {
      this.#keyframeIdx = targetKeyframeIdx;
    }
    this.dispatchEvent(new Event("cm-afterframechange", { bubbles: true }));
    return true;
  }

  _setClassesAndStates(targetIdx: number): void {
    for (const state of this.#internals.states) {
      if (/^frame[0-9]+$/.test(state)) {
        this.#internals.states.delete(state);
      }
    }
    this.#internals.states.add(`frame${targetIdx}`);
    this.#internals.states.add(`hasNext`);
    this.#internals.states.add(`hasPrev`);
    if (targetIdx === 0) {
      this.#internals.states.delete(`hasPrev`);
    }
    if (targetIdx === this.#keyframes.at(-1)) {
      this.#internals.states.delete(`hasNext`);
    }
    const defaultSlot =
      this._shadow.querySelector<HTMLSlotElement>("slot:not([name])");
    const targetNode = defaultSlot?.assignedElements()[0];
    if (!targetNode) {
      return;
    }
    for (const className of targetNode.classList) {
      if (/^frame[0-9]+$/.test(className)) {
        targetNode.classList.remove(className);
      }
    }
    targetNode.classList.add(`frame${targetIdx}`);
  }

  #updateAuxStyles(): void {
    let css = `slot[name="aux"]::slotted(*){ display: none }`;
    for (const frameIdx of this.#keyframes) {
      css += `:host(:state(frame${frameIdx})) slot[name="aux"]::slotted(.frame${frameIdx}) { display: block; }`;
    }
    this.#auxStyles.replaceSync(css);
  }

  next(): number {
    const before = this.#keyframeIdx;
    this.#keyframeIdx += 1;
    const success = this._goToCurrent();
    if (!success) {
      this.#keyframeIdx = before;
      return before;
    }
    return this.current;
  }

  prev(): number {
    const before = this.#keyframeIdx;
    this.#keyframeIdx -= 1;
    const success = this._goToCurrent();
    if (!success) {
      this.#keyframeIdx = before;
      return before;
    }
    return this.current;
  }

  go(inputValue: number): number {
    const before = this.#keyframeIdx;
    this.#keyframeIdx = this._toKeyframeIdx(inputValue);
    const success = this._goToCurrent();
    if (!success) {
      this.#keyframeIdx = before;
      return before;
    }
    return this.current;
  }

  _handleClick = (evt: Event) => {
    if (evt.type === "click") {
      for (const object of evt.composedPath()) {
        if (object instanceof HTMLElement) {
          if (object.getAttribute("data-command") === "next") {
            this.next();
            return;
          }
          if (object.getAttribute("data-command") === "prev") {
            this.prev();
            return;
          }
        }
      }
    }
  };
}
