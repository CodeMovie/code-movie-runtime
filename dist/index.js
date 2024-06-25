var k=Object.defineProperty;var b=n=>{throw TypeError(n)};var v=(n,r,t)=>r in n?k(n,r,{enumerable:!0,configurable:!0,writable:!0,value:t}):n[r]=t;var p=(n,r,t)=>v(n,typeof r!="symbol"?r+"":r,t),g=(n,r,t)=>r.has(n)||b("Cannot "+t);var s=(n,r,t)=>(g(n,r,"read from private field"),t?t.call(n):r.get(n)),l=(n,r,t)=>r.has(n)?b("Cannot add the same private member more than once"):r instanceof WeakSet?r.add(n):r.set(n,t),a=(n,r,t,e)=>(g(n,r,"write to private field"),e?e.call(n,t):r.set(n,t),t);function y(n){let r=Math.round(Number(n));return Number.isFinite(r)&&!Number.isNaN(r)?r:0}function x(n){return Math.abs(y(n))}function E(n){return n?String(n).split(/\s+/).map(x).sort((r,t)=>r-t):[]}var c,h,i,u,m,d=class d extends HTMLElement{constructor(){super();l(this,c,this.attachShadow({mode:"open"}));l(this,h);l(this,i,[]);l(this,u,0);l(this,m,null);p(this,"_handleClick",t=>{if(t.type==="click"){for(let e of t.composedPath())if(e instanceof HTMLElement){if(e.getAttribute("data-command")==="next"){this.next();return}if(e.getAttribute("data-command")==="prev"){this.prev();return}}}});let[t,e,o]=d._template();a(this,h,t),s(this,c).append(t,e,o),s(this,c).addEventListener("click",this._handleClick)}static _template(){let t=document.createElement("slot"),e=document.createElement("slot");e.name="controls",e.innerHTML=`
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
    `,[t,e,o]}static get observedAttributes(){return["keyframes","current"]}attributeChangedCallback(t,e,o){e!==o&&(t==="keyframes"?(a(this,i,E(o)),this._goToCurrent()):t==="current"&&(a(this,u,this._toKeyframeIdx(o)),this._goToCurrent()))}get controls(){return this.hasAttribute("controls")}set controls(t){t?this.setAttribute("controls","controls"):this.removeAttribute("controls")}get keyframes(){return s(this,i)}set keyframes(t){Array.isArray(t)?(t=Array.from(new Set(t.map(x).sort((e,o)=>e-o))),this.setAttribute("keyframes",t.join(" ")),a(this,i,t)):(this.removeAttribute("keyframes"),a(this,i,[])),this._goToCurrent()}_toKeyframeIdx(t){let e=y(t);return e<0&&(e=Math.abs(e)-1),e>this.maxFrame&&(e=this.maxFrame),s(this,i).indexOf(e)}get current(){return s(this,i)[s(this,u)]||0}set current(t){let e=this._toKeyframeIdx(t);e!==-1?(a(this,u,e),this.setAttribute("current",String(s(this,i)[e]))):(a(this,u,0),this.setAttribute("current","0"))}get nextCurrent(){return s(this,m)&&s(this,i)[s(this,u)]||null}get maxFrame(){return Math.max(...this.keyframes)}_goToCurrent(){let t=s(this,u);t in s(this,i)||(s(this,i).length>=1&&t<0?t=s(this,i).length-1:t=0),a(this,m,t);let e=this.dispatchEvent(new Event("cm-beforeframechange",{bubbles:!0,cancelable:!0}));a(this,m,null),e&&(this._setClass(s(this,i)[t]),t!==s(this,u)&&a(this,u,t),this.dispatchEvent(new Event("cm-afterframechange",{bubbles:!0})))}_setClass(t){let e=s(this,h).assignedElements()[0];if(e){for(let o of e.classList)/^frame[0-9]+$/.test(o)&&e.classList.remove(o);e.classList.add(`frame${t}`)}}next(){return a(this,u,s(this,u)+1),this._goToCurrent(),this.current}prev(){return a(this,u,s(this,u)-1),this._goToCurrent(),this.current}};c=new WeakMap,h=new WeakMap,i=new WeakMap,u=new WeakMap,m=new WeakMap;var f=d;window.customElements.define("code-movie-runtime",f);export{f as CodeMovieRuntime};
