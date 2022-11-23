"use strict";(()=>{var k=Object.defineProperty;var v=(n,r,t)=>r in n?k(n,r,{enumerable:!0,configurable:!0,writable:!0,value:t}):n[r]=t;var b=(n,r,t)=>(v(n,typeof r!="symbol"?r+"":r,t),t),p=(n,r,t)=>{if(!r.has(n))throw TypeError("Cannot "+t)};var s=(n,r,t)=>(p(n,r,"read from private field"),t?t.call(n):r.get(n)),u=(n,r,t)=>{if(r.has(n))throw TypeError("Cannot add the same private member more than once");r instanceof WeakSet?r.add(n):r.set(n,t)},a=(n,r,t,e)=>(p(n,r,"write to private field"),e?e.call(n,t):r.set(n,t),t);function x(n){return Array.from(new Set(n))}function g(n){let r=Math.round(Number(n));return Number.isFinite(r)&&!Number.isNaN(r)?r:0}function y(n){return Math.abs(g(n))}function E(n){return n?String(n).split(/\s+/).map(y).sort((r,t)=>r-t):[]}var m,h,i,l,c,f=class extends HTMLElement{constructor(){super();u(this,m,this.attachShadow({mode:"open"}));u(this,h,void 0);u(this,i,[]);u(this,l,0);u(this,c,null);b(this,"_handleClick",t=>{if(t.type==="click"){for(let e of t.composedPath())if(e instanceof HTMLElement){if(e.getAttribute("data-command")==="next"){this.next();return}if(e.getAttribute("data-command")==="prev"){this.prev();return}}}});let[t,e,o]=f._template();a(this,h,t),s(this,m).append(t,e,o)}static _template(){let t=document.createElement("slot"),e=document.createElement("slot");e.name="controls",e.innerHTML=`
      <div part="controls" class="defaultControls">
        <button part="controls-prevBtn" data-command="prev">
          <span>&lt;</span>
        </button>
        <button part="controls-nextBtn" data-command="next">
          <span>&gt;</span>
        </button>
      </div>
    `;let o=document.createElement("style");return o.innerHTML=`
      :host { display: grid; }
      :host(:not([controls])) slot[name=controls] { display: none }
      .defaultControls { position: relative; z-index: 1337; }
    `,[t,e,o]}static get observedAttributes(){return["keyframes","current"]}attributeChangedCallback(t,e,o){e!==o&&(t==="keyframes"?(a(this,i,E(o)),this._goToCurrent()):t==="current"&&(a(this,l,this._toKeyframeIdx(o)),this._goToCurrent()))}get controls(){return this.hasAttribute("controls")}set controls(t){t?this.setAttribute("controls","controls"):this.removeAttribute("controls")}get keyframes(){return s(this,i)}set keyframes(t){Array.isArray(t)?(t=x(t.map(y).sort((e,o)=>e-o)),this.setAttribute("keyframes",t.join(" ")),a(this,i,t)):(this.removeAttribute("keyframes"),a(this,i,[])),this._goToCurrent()}_toKeyframeIdx(t){let e=g(t);return e<0&&(e=Math.abs(e)-1),e>this.maxFrame&&(e=this.maxFrame),s(this,i).indexOf(e)}get current(){return s(this,i)[s(this,l)]||0}set current(t){let e=this._toKeyframeIdx(t);e!==-1?(a(this,l,e),this.setAttribute("current",String(s(this,i)[e]))):(a(this,l,0),this.setAttribute("current","0"))}get nextCurrent(){return s(this,c)&&s(this,i)[s(this,l)]||null}get maxFrame(){return Math.max(...this.keyframes)}_goToCurrent(){let t=s(this,l);t in s(this,i)||(s(this,i).length>=1&&t<0?t=s(this,i).length-1:t=0),a(this,c,t);let e=this.dispatchEvent(new Event("cm-beforeframechange",{bubbles:!0,cancelable:!0}));a(this,c,null),e&&(this._setClass(s(this,i)[t]),t!==s(this,l)&&a(this,l,t),this.dispatchEvent(new Event("cm-afterframechange",{bubbles:!0})))}_setClass(t){let e=s(this,h).assignedElements()[0];if(!!e){for(let o of e.classList)/^frame[0-9]+$/.test(o)&&e.classList.remove(o);e.classList.add(`frame${t}`)}}next(){return a(this,l,s(this,l)+1),this._goToCurrent(),this.current}prev(){return a(this,l,s(this,l)-1),this._goToCurrent(),this.current}connectedCallback(){s(this,m).addEventListener("click",this._handleClick)}disconnectedCallback(){s(this,m).removeEventListener("click",this._handleClick)}},d=f;m=new WeakMap,h=new WeakMap,i=new WeakMap,l=new WeakMap,c=new WeakMap;window.customElements.get("code-movie-runtime")??window.customElements.define("code-movie-runtime",d);})();