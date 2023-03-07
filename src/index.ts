import { CmAfterFrameChangeEvent, CmBeforeFrameChangeEvent } from "./events";
import {
  parseKeyframesAttributeValue,
  toFiniteInt,
  toPositiveFiniteInt,
  unique,
} from "./lib";

declare global {
  interface HTMLElementTagNameMap {
    "code-movie-runtime": CodeMovieRuntime;
  }
}

export class CodeMovieRuntime extends HTMLElement {
  // The template function must be public to allow users to replace it
  static _template(): [HTMLSlotElement, HTMLSlotElement, HTMLStyleElement] {
    const mainSlot = document.createElement("slot");
    const controlsSlot = document.createElement("slot");
    controlsSlot.name = "controls";
    controlsSlot.innerHTML = `
      <div part="controls" class="defaultControls">
        <button part="controls-prevBtn" data-command="prev">
          <span>&lt;</span>
        </button>
        <button part="controls-nextBtn" data-command="next">
          <span>&gt;</span>
        </button>
      </div>
    `;
    const styles = document.createElement("style");
    styles.innerHTML = `
      :host { display: grid; }
      :host(:not([controls])) slot[name=controls] { display: none }
      .defaultControls { position: relative; z-index: 1337; }
    `;
    return [mainSlot, controlsSlot, styles];
  }

  // Shadow DOM must be open to allow users to mess with its contents
  #shadow = this.attachShadow({ mode: "open" });

  // Hosts the runtime's content. The first hosted element gets assigned the
  // classes that change in lockstep with "current". The class field serves as
  // a shortcut to the element in all the methods that need to deal with the
  // content
  #mainSlot: HTMLSlotElement;

  // List of the keyframe indices
  #keyframes: number[] = [];

  // Current index in the array of keyframes. The public getter "current"
  // is derived from #keyframes and #keyframeIdx
  #keyframeIdx = 0;

  // Next index in the array of keyframes. Always null except when the event
  // `cm-beforeframechange` fires.
  #nextKeyframeIdx: null | number = null;

  constructor() {
    super();
    const [mainSlot, controlsSlot, styles] = CodeMovieRuntime._template();
    this.#mainSlot = mainSlot;
    this.#shadow.append(mainSlot, controlsSlot, styles);
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
      value = unique(value.map(toPositiveFiniteInt).sort((a, b) => a - b));
      this.setAttribute("keyframes", value.join(" "));
      this.#keyframes = value;
    } else {
      this.removeAttribute("keyframes");
      this.#keyframes = [];
    }
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

  _goToCurrent() {
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
    const proceed = this.dispatchEvent(new CmBeforeFrameChangeEvent());
    this.#nextKeyframeIdx = null;
    if (!proceed) {
      return;
    }
    this._setClass(this.#keyframes[targetKeyframeIdx]);
    if (targetKeyframeIdx !== this.#keyframeIdx) {
      this.#keyframeIdx = targetKeyframeIdx;
    }
    this.dispatchEvent(new CmAfterFrameChangeEvent());
  }

  _setClass(targetKeyframe: number): void {
    const targetNode = this.#mainSlot.assignedElements()[0];
    if (!targetNode) {
      return;
    }
    for (const className of targetNode.classList) {
      if (/^frame[0-9]+$/.test(className)) {
        targetNode.classList.remove(className);
      }
    }
    targetNode.classList.add(`frame${targetKeyframe}`);
  }

  next(): number {
    this.#keyframeIdx += 1;
    this._goToCurrent();
    return this.current;
  }

  prev(): number {
    this.#keyframeIdx -= 1;
    this._goToCurrent();
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

  connectedCallback(): void {
    this.#shadow.addEventListener("click", this._handleClick);
  }

  disconnectedCallback(): void {
    this.#shadow.removeEventListener("click", this._handleClick);
  }
}
