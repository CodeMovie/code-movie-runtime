export declare class CodeMovieRuntime extends HTMLElement {
    #private;
    static _template(): Element[];
    _shadow: ShadowRoot;
    constructor();
    static get observedAttributes(): string[];
    attributeChangedCallback(name: string, oldValue: unknown, newValue: string): void;
    get controls(): boolean;
    set controls(value: boolean);
    get keyframes(): any[];
    set keyframes(value: any[]);
    _toKeyframeIdx(inputValue: unknown): number;
    get current(): number;
    set current(inputValue: unknown);
    get nextCurrent(): number | null;
    get maxFrame(): number;
    _goToCurrent(): boolean;
    _setClassesAndStates(targetIdx: number): void;
    next(): number;
    prev(): number;
    go(inputValue: number): number;
    _handleClick: (evt: Event) => void;
}
