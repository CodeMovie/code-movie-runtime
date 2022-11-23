var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var _shadow, _mainSlot, _keyframes, _keyframeIdx, _nextKeyframeIdx;
function unique(input) {
  return Array.from(new Set(input));
}
function toFiniteInt(value) {
  const asInt = Math.round(Number(value));
  if (Number.isFinite(asInt) && !Number.isNaN(asInt)) {
    return asInt;
  }
  return 0;
}
function toPositiveFiniteInt(value) {
  return Math.abs(toFiniteInt(value));
}
function parseKeyframesAttributeValue(value) {
  if (value) {
    return String(value).split(/\s+/).map(toPositiveFiniteInt).sort((a, b) => a - b);
  }
  return [];
}
const _CodeMovieRuntime = class extends HTMLElement {
  constructor() {
    super();
    __privateAdd(this, _shadow, this.attachShadow({ mode: "open" }));
    __privateAdd(this, _mainSlot, void 0);
    __privateAdd(this, _keyframes, []);
    __privateAdd(this, _keyframeIdx, 0);
    __privateAdd(this, _nextKeyframeIdx, null);
    __publicField(this, "_handleClick", (evt) => {
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
    });
    const [mainSlot, controlsSlot, styles] = _CodeMovieRuntime._template();
    __privateSet(this, _mainSlot, mainSlot);
    __privateGet(this, _shadow).append(mainSlot, controlsSlot, styles);
  }
  static _template() {
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
  static get observedAttributes() {
    return ["keyframes", "current"];
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) {
      return;
    }
    if (name === "keyframes") {
      __privateSet(this, _keyframes, parseKeyframesAttributeValue(newValue));
      this._goToCurrent();
    } else if (name === "current") {
      __privateSet(this, _keyframeIdx, this._toKeyframeIdx(newValue));
      this._goToCurrent();
    }
  }
  get controls() {
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
    return __privateGet(this, _keyframes);
  }
  set keyframes(value) {
    if (Array.isArray(value)) {
      value = unique(value.map(toPositiveFiniteInt).sort((a, b) => a - b));
      this.setAttribute("keyframes", value.join(" "));
      __privateSet(this, _keyframes, value);
    } else {
      this.removeAttribute("keyframes");
      __privateSet(this, _keyframes, []);
    }
    this._goToCurrent();
  }
  _toKeyframeIdx(inputValue) {
    let value = toFiniteInt(inputValue);
    if (value < 0) {
      value = Math.abs(value) - 1;
    }
    if (value > this.maxFrame) {
      value = this.maxFrame;
    }
    return __privateGet(this, _keyframes).indexOf(value);
  }
  get current() {
    return __privateGet(this, _keyframes)[__privateGet(this, _keyframeIdx)] || 0;
  }
  set current(inputValue) {
    const newKeyframeIdx = this._toKeyframeIdx(inputValue);
    if (newKeyframeIdx !== -1) {
      __privateSet(this, _keyframeIdx, newKeyframeIdx);
      this.setAttribute("current", String(__privateGet(this, _keyframes)[newKeyframeIdx]));
    } else {
      __privateSet(this, _keyframeIdx, 0);
      this.setAttribute("current", "0");
    }
  }
  get nextCurrent() {
    if (__privateGet(this, _nextKeyframeIdx)) {
      return __privateGet(this, _keyframes)[__privateGet(this, _keyframeIdx)] || null;
    }
    return null;
  }
  get maxFrame() {
    return Math.max(...this.keyframes);
  }
  _goToCurrent() {
    let targetKeyframeIdx = __privateGet(this, _keyframeIdx);
    if (!(targetKeyframeIdx in __privateGet(this, _keyframes))) {
      if (__privateGet(this, _keyframes).length >= 1) {
        if (targetKeyframeIdx < 0) {
          targetKeyframeIdx = __privateGet(this, _keyframes).length - 1;
        } else {
          targetKeyframeIdx = 0;
        }
      } else {
        targetKeyframeIdx = 0;
      }
    }
    __privateSet(this, _nextKeyframeIdx, targetKeyframeIdx);
    const proceed = this.dispatchEvent(
      new Event("cm-beforeframechange", { bubbles: true, cancelable: true })
    );
    __privateSet(this, _nextKeyframeIdx, null);
    if (!proceed) {
      return;
    }
    this._setClass(__privateGet(this, _keyframes)[targetKeyframeIdx]);
    if (targetKeyframeIdx !== __privateGet(this, _keyframeIdx)) {
      __privateSet(this, _keyframeIdx, targetKeyframeIdx);
    }
    this.dispatchEvent(new Event("cm-afterframechange", { bubbles: true }));
  }
  _setClass(targetKeyframe) {
    const targetNode = __privateGet(this, _mainSlot).assignedElements()[0];
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
  next() {
    __privateSet(this, _keyframeIdx, __privateGet(this, _keyframeIdx) + 1);
    this._goToCurrent();
    return this.current;
  }
  prev() {
    __privateSet(this, _keyframeIdx, __privateGet(this, _keyframeIdx) - 1);
    this._goToCurrent();
    return this.current;
  }
  connectedCallback() {
    __privateGet(this, _shadow).addEventListener("click", this._handleClick);
  }
  disconnectedCallback() {
    __privateGet(this, _shadow).removeEventListener("click", this._handleClick);
  }
};
let CodeMovieRuntime = _CodeMovieRuntime;
_shadow = new WeakMap();
_mainSlot = new WeakMap();
_keyframes = new WeakMap();
_keyframeIdx = new WeakMap();
_nextKeyframeIdx = new WeakMap();
export {
  CodeMovieRuntime
};
