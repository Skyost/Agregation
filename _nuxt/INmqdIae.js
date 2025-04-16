import{d as f,G as m,H as E,I as T,J as X,B as P,r as _,K as q,L as H,c as j,f as D,o as N,n as V}from"./Cqy89Lp9.js";const b=Symbol("head-component"),x={body:{type:Boolean,default:void 0},tagPosition:{type:String}},v=o=>{const t=Object.fromEntries(Object.entries(o).filter(([e,n])=>n!==void 0));return typeof t.body<"u"&&(t.tagPosition=t.body?"bodyClose":"head"),typeof t.renderPriority<"u"&&(t.tagPriority=t.renderPriority),t};function g(){return E(b,z,!0)}function z(){const o=E(b,null);if(o)return o;const t=T({}),e=X(t),n={input:t,entry:e};return P(b,n),n}const h={accesskey:String,autocapitalize:String,autofocus:{type:Boolean,default:void 0},class:{type:[String,Object,Array],default:void 0},contenteditable:{type:Boolean,default:void 0},contextmenu:String,dir:String,draggable:{type:Boolean,default:void 0},enterkeyhint:String,exportparts:String,hidden:{type:Boolean,default:void 0},id:String,inputmode:String,is:String,itemid:String,itemprop:String,itemref:String,itemscope:String,itemtype:String,lang:String,nonce:String,part:String,slot:String,spellcheck:{type:Boolean,default:void 0},style:{type:[String,Object,Array],default:void 0},tabindex:String,title:String,translate:String,renderPriority:[String,Number],tagPriority:{type:[String,Number]}};f({name:"NoScript",inheritAttrs:!1,props:{...h,...x,title:String},setup(o,{slots:t}){const{input:e}=g();e.noscript||(e.noscript=[]);const n=e.noscript.push({})-1;return m(()=>e.noscript[n]=null),()=>{var c;const a=v(o),p=(c=t.default)==null?void 0:c.call(t),s=p?p.filter(({children:u})=>u).map(({children:u})=>u).join(""):"";return s&&(a.innerHTML=s),e.noscript[n]=a,null}}});f({name:"Link",inheritAttrs:!1,props:{...h,...x,as:String,crossorigin:String,disabled:Boolean,fetchpriority:String,href:String,hreflang:String,imagesizes:String,imagesrcset:String,integrity:String,media:String,prefetch:{type:Boolean,default:void 0},referrerpolicy:String,rel:String,sizes:String,title:String,type:String,methods:String,target:String},setup(o){const{input:t}=g();t.link||(t.link=[]);const e=t.link.push({})-1;return m(()=>t.link[e]=null),()=>(t.link[e]=v(o),null)}});f({name:"Base",inheritAttrs:!1,props:{...h,href:String,target:String},setup(o){const{input:t}=g();return m(()=>t.base=null),()=>(t.base=v(o),null)}});const R=f({name:"Title",inheritAttrs:!1,setup(o,{slots:t}){const{input:e}=g();return m(()=>e.title=null),()=>{var a,p,s;const n=(a=t.default)==null?void 0:a.call(t);return e.title=(p=n==null?void 0:n[0])!=null&&p.children?String((s=n==null?void 0:n[0])==null?void 0:s.children):void 0,null}}}),W=f({name:"Meta",inheritAttrs:!1,props:{...h,charset:String,content:String,httpEquiv:String,name:String,property:String},setup(o){const{input:t}=g();t.meta||(t.meta=[]);const e=t.meta.push({})-1;return m(()=>t.meta[e]=null),()=>{const n={"http-equiv":o.httpEquiv,...v(o)};return"httpEquiv"in n&&delete n.httpEquiv,t.meta[e]=n,null}}});f({name:"Style",inheritAttrs:!1,props:{...h,...x,type:String,media:String,nonce:String,title:String,scoped:{type:Boolean,default:void 0}},setup(o,{slots:t}){const{input:e}=g();e.style||(e.style=[]);const n=e.style.push({})-1;return m(()=>e.style[n]=null),()=>{var s,c,u;const a=v(o),p=(u=(c=(s=t.default)==null?void 0:s.call(t))==null?void 0:c[0])==null?void 0:u.children;return p&&(e.style[n]=a,a.textContent=p),null}}});f({name:"Html",inheritAttrs:!1,props:{...h,manifest:String,version:String,xmlns:String},setup(o,t){const{input:e}=g();return m(()=>e.htmlAttrs=null),()=>{var n,a;return e.htmlAttrs={...o,...t.attrs},(a=(n=t.slots).default)==null?void 0:a.call(n)}}});const w=["innerHTML"],O=f({__name:"MathDocument",props:{body:{}},setup(o){const t=_(null),e=_(null),n=()=>{const s=document.createElement("li");return s.style.setProperty("content","'(i)'","important"),getComputedStyle(s,"::marker").content==="none"},a=s=>{if(isNaN(s))return null;const c=String(+s).split(""),u=["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM","","X","XX","XXX","XL","L","LX","LXX","LXXX","XC","","I","II","III","IV","V","VI","VII","VIII","IX"];let S="",C=3;for(;C--;)S=(u[+c.pop()+C*10]||"")+S;return Array(+c.join("")+1).join("M")+S},p=()=>{var k,L;const s=t.value.querySelectorAll("table");for(const r of s){r.classList.add("table","table-bordered","table-hover");const i=r.parentNode,l=document.createElement("div");l.classList.add("table-responsive"),i.replaceChild(l,r),l.appendChild(r)}if(n()){const r=t.value.querySelectorAll("ol");for(const i of r){i.classList.add("safari-ol-fix");const l=i.querySelectorAll("li");for(let d=0;d<l.length;d++){const y=l[d];y.classList.add("safari-li-fix");const M=`<span class="safari-marker">(${a(d+1).toLowerCase()})</span> `;y.insertAdjacentHTML("afterbegin",M)}}}const c=t.value.querySelectorAll(".bookref");let u=0;for(const r of c){const i=r.firstElementChild;u=Math.max(u,i.offsetWidth)}const S=`${u+15}px`;t.value.style.paddingRight=S;for(const r of c){const i=r.firstElementChild;i.style.right=S}const C=D(),B=t.value.querySelectorAll(".devlink");for(const r of B){const i=document.createElement("a"),l=`/developpements/${r.textContent.trim()}/`;i.innerText="Développement",i.setAttribute("href",l),i.onclick=d=>{d.preventDefault(),C.push(l)},r.replaceChildren(i),r.nextElementSibling&&((k=r.parentNode)==null||k.insertBefore(r.nextElementSibling,r))}const A=t.value.querySelectorAll(".proof");for(let r=0;r<A.length;r++){const i=A[r],l=`proof-${r+1}`,d=document.createElement("details");d.setAttribute("id",l),d.innerHTML=i.outerHTML,(L=i.parentNode)==null||L.insertBefore(d,i),i.remove();const y=document.createElement("summary");y.classList.add("proof-label"),y.innerText="Preuve",d.insertBefore(y,d.firstChild)}const I=t.value.querySelectorAll('[data-reference-type="ref"]');for(const r of I){const i=document.getElementById(r.getAttribute("data-reference"));if(i){const l=i.querySelector("strong, em");l&&l.textContent&&(r.textContent=l.textContent)}}e.value=null};return q(async()=>{await H(),p()}),m(()=>{e.value&&(clearTimeout(e.value),e.value=null)}),(s,c)=>(N(),j("div",{ref_key:"root",ref:t,class:"math-document",innerHTML:s.body},null,8,w))}}),F=V(O,[["__scopeId","data-v-ea3ac75d"]]);export{W as M,R as T,F as _};
