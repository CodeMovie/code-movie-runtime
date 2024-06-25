export declare class CodeMovieRuntime extends HTMLElement {
    #private;
    static _template(): [HTMLSlotElement, HTMLSlotElement, HTMLStyleElement];
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
    _goToCurrent(): void;
    _setClass(targetKeyframe: number): void;
    next(): number;
    prev(): number;
    _handleClick: (evt: Event) => void;
}
