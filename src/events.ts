export class CmBeforeFrameChangeEvent extends Event {
  constructor() {
    super("cm-beforeframechange", { bubbles: true, cancelable: true });
  }
}

export class CmAfterFrameChangeEvent extends Event {
  constructor() {
    super("cm-afterframechange", { bubbles: true });
  }
}

declare global {
  interface HTMLEventMap {
    "cm-beforeframechange": CmBeforeFrameChangeEvent;
    "cm-afterframechange": CmAfterFrameChangeEvent;
  }
}
